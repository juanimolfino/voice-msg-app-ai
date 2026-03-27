// src/components/TestBuyButton.tsx
"use client";

import { useState } from "react";

export function TestBuyButton() {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      // 👉 Llamamos a nuestra API para crear la sesión de checkout
      const res = await fetch("/api/stripe/checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "credits_10" }), // Comprar 10 créditos ($5)
      });

      const data = await res.json();

      if (data.url) {
        // 👉 Redirigimos a Stripe Checkout
        window.location.href = data.url;
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.log("Error de conexión:", err);
      alert("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
    >
      {loading ? "Cargando..." : "🧪 Test: Comprar 10 créditos ($5)"}
    </button>
  );
}
