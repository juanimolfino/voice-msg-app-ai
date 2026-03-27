// src/app/api/stripe/verify-session/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";
import { db } from "@/services/database/db";
import { 
  isPaymentAlreadyProcessed, 
  logPaymentStart, 
  logPaymentCompleted
} from "@/services/payments/paymentAudit";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true });

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json({ error: "No session ID" }, { status: 400 });
    }

    const authSession = await getServerSession(authOptions);
    if (!authSession?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const alreadyProcessed = await isPaymentAlreadyProcessed(sessionId);
    if (alreadyProcessed) {
      console.log(`⏩ Checkout ${sessionId} already processed (fallback)`);
      return NextResponse.json({ success: true, alreadyProcessed: true });
    }

    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ error: "Pago no completado" }, { status: 400 });
    }

    const userId = checkoutSession.metadata?.userId;
    const type = checkoutSession.metadata?.type;

    if (!userId || !type) {
      return NextResponse.json({ error: "Metadata inválida" }, { status: 400 });
    }

    if (userId !== authSession.user.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const validTypes = ['credits_10', 'credits_50', 'pro_light', 'pro_unlimited'] as const;
    if (!validTypes.includes(type as typeof validTypes[number])) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const paymentType = type as 'credits_10' | 'credits_50' | 'pro_light' | 'pro_unlimited';

    await logPaymentStart({
      userId,
      sessionId: checkoutSession.id,
      type: paymentType,
      amount: checkoutSession.amount_total || 0,
      currency: checkoutSession.currency || 'aud',
      paymentIntentId: typeof checkoutSession.payment_intent === 'string' 
        ? checkoutSession.payment_intent 
        : undefined
    });

    if (checkoutSession.mode === 'payment') {
      const credits = paymentType === 'credits_10' ? 10 : 50;
      
      await db.query(
        `UPDATE user_credits 
         SET credits = credits + $2,
             total_purchased_credits = total_purchased_credits + $2,
             last_credit_purchase_at = NOW(),
             updated_at = NOW()
         WHERE user_id = $1`,
        [userId, credits]
      );
      
      console.log(`✅ [Fallback] Créditos agregados: ${credits} para ${userId}`);
      
      await logPaymentCompleted(sessionId, { 
        processing_source: 'fallback',
        credits_added: credits 
      });
      
      return NextResponse.json({ success: true, creditsAdded: credits });
      
    } else {
      return NextResponse.json({ success: true, subscription: true });
    }
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Verify session error:", error, "Message:", errorMessage);
    return NextResponse.json({ error: "Error al verificar" }, { status: 500 });
  }
}