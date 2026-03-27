// src/app/api/stripe/webhook/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/services/database/db";
import { 
  isPaymentAlreadyProcessed, 
  logPaymentStart, 
  logPaymentCompleted, 
  logPaymentDuplicate,
  logPaymentFailed 
} from "@/services/payments/paymentAudit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true });
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const payload = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error("Webhook signature verification failed:", message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      
      const alreadyProcessed = await isPaymentAlreadyProcessed(session.id);
      if (alreadyProcessed) {
        console.log(`⏩ Checkout ${session.id} already processed, skipping`);
        await logPaymentDuplicate(session.id);
        return NextResponse.json({ received: true, status: "duplicate" });
      }

      await handleCheckoutCompleted(session);
    }
    
    else if (event.type === "invoice.paid") {
      const invoice = event.data.object as Stripe.Invoice;
      await handleSubscriptionRenewal(invoice);
    }
    
    else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancelled(subscription);
    }

    return NextResponse.json({ received: true });
    
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const type = session.metadata?.type;
  
  if (!userId || !type) {
    console.error("Missing metadata in session:", session.id);
    return;
  }

  const validTypes = ['credits_10', 'credits_50', 'pro_light', 'pro_unlimited'] as const;
  if (!validTypes.includes(type as typeof validTypes[number])) {
    console.error("Invalid type:", type);
    return;
  }

  const paymentType = type as 'credits_10' | 'credits_50' | 'pro_light' | 'pro_unlimited';

  await logPaymentStart({
    userId,
    sessionId: session.id,
    type: paymentType,
    amount: session.amount_total || 0,
    currency: session.currency || 'aud',
    paymentIntentId: typeof session.payment_intent === 'string' 
      ? session.payment_intent 
      : undefined
  });

  try {
    if (session.mode === "subscription") {
      const plan = paymentType as 'pro_light' | 'pro_unlimited';
      const includedCredits = plan === 'pro_light' ? 50 : 200;
      
      const subscriptionId = typeof session.subscription === 'string' 
        ? session.subscription 
        : session.subscription?.id;
        
      const customerId = typeof session.customer === 'string'
        ? session.customer
        : session.customer?.id;

      await db.query(
        `
        INSERT INTO user_credits 
          (user_id, plan, included_credits, used_credits, stripe_customer_id, stripe_subscription_id, reset_at)
        VALUES 
          ($1, $2, $3, 0, $4, $5, $6)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          plan = EXCLUDED.plan,
          included_credits = EXCLUDED.included_credits,
          used_credits = 0,
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          reset_at = EXCLUDED.reset_at,
          updated_at = NOW()
        `,
        [userId, plan, includedCredits, customerId, subscriptionId, getNextResetDate()]
      );
      
      console.log(`✅ Suscripción activada: ${plan} para ${userId}`);
      
    } else {
      const credits = paymentType === 'credits_10' ? 10 : 50;
      
      await db.query(
        `
        UPDATE user_credits 
        SET credits = credits + $2,
            total_purchased_credits = total_purchased_credits + $2,
            last_credit_purchase_at = NOW(),
            updated_at = NOW()
        WHERE user_id = $1
        `,
        [userId, credits]
      );
      
      console.log(`✅ Créditos agregados: ${credits} para ${userId}`);
    }

    await logPaymentCompleted(session.id, { 
      processing_source: 'webhook',
      mode: session.mode,
      type: paymentType
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error processing checkout:", error);
    await logPaymentFailed(session.id, errorMessage);
    throw error;
  }
}

async function handleSubscriptionRenewal(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as unknown as { subscription?: string }).subscription;
  
  if (!subscriptionId || typeof subscriptionId !== 'string') return;
  
  const result = await db.query(
    "SELECT user_id FROM user_credits WHERE stripe_subscription_id = $1",
    [subscriptionId]
  );
  
  if (result.rows.length === 0) return;
  
  const userId = result.rows[0].user_id;
  
  await db.query(
    `
    UPDATE user_credits 
    SET used_credits = 0, reset_at = $2, updated_at = NOW()
    WHERE user_id = $1
    `,
    [userId, getNextResetDate()]
  );
  
  console.log(`🔄 Contador mensual reseteado para ${userId}`);
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  const result = await db.query(
    "SELECT user_id FROM user_credits WHERE stripe_subscription_id = $1",
    [subscription.id]
  );
  
  if (result.rows.length === 0) return;
  
  const userId = result.rows[0].user_id;
  
  const currentPeriodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;
  
  if (typeof currentPeriodEnd !== 'number') {
    console.error("No current_period_end found");
    return;
  }
  
  const endDate = new Date(currentPeriodEnd * 1000);
  
  await db.query(
    `
    UPDATE user_credits 
    SET subscription_ends_at = $2, updated_at = NOW()
    WHERE user_id = $1
    `,
    [userId, endDate]
  );
  
  console.log(`⏳ Suscripción cancelada para ${userId}, termina el ${endDate}`);
}

function getNextResetDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1);
}