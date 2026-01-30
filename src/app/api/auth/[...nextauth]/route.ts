import NextAuth, { type NextAuthOptions } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import PostgresAdapter from "@auth/pg-adapter";
import { pool } from "@/lib/db";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const authOptions: NextAuthOptions = {
  adapter: PostgresAdapter(pool),
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url }) {
        await resend.emails.send({
          from: process.env.EMAIL_FROM!,
          to: identifier,
          subject: "Tu link mágico",
          html: `
            <p>Hacé click para entrar:</p>
            <a href="${url}">Entrar</a>
          `,
        });
      },
    }),
  ],
  session: {
    strategy: "database",
  },
  // pages: {
  //   signIn: "/login",
  // },
  // callbacks: {
  //   async redirect({ baseUrl }) {
  //     return baseUrl; // siempre "/"
  //   },
  // },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
