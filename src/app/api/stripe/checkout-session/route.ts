// src/app/api/stripe/checkout-session/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { typescript: true });

// 👉 MAPEO CORREGIDO según el CSV:
const PRICE_MAP = {
  // Suscripciones (Monthly):
  pro_light: "price_1T9HGpAXV285h2ovoynGaBL7",      // $19/mes - Pro Light
  pro_unlimited: "price_1T9HJdAXV285h2ovqzO0AuUD",  // $49/mes - Pro Unlimited
  
  // One-time (Packs de créditos):
  credits_10: "price_1T9HKDAXV285h2ovdTwdIWDh",     // $5 - Pack 10 Créditos
  credits_50: "price_1T9HKpAXV285h2ovPuJCDqKp",     // $20 - Pack 50 Créditos
};

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const userId = session.user.id;
    const userEmail = session.user.email;
    const body = await req.json();
    const { type } = body;

    if (!PRICE_MAP[type as keyof typeof PRICE_MAP]) {
      return NextResponse.json({ error: "Tipo inválido" }, { status: 400 });
    }

    const mode = type.startsWith("pro_") ? "subscription" : "payment";

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: userEmail || undefined,
      line_items: [{ price: PRICE_MAP[type as keyof typeof PRICE_MAP], quantity: 1 }],
      mode: mode as "subscription" | "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancelled`,
      metadata: { userId, type },
    });

    return NextResponse.json({ url: checkoutSession.url });
    
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Error al crear sesión de pago" }, 
      { status: 500 }
    );
  }
}