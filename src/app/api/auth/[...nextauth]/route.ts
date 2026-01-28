import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import PostgresAdapter from "@auth/pg-adapter";
import { pool } from "@/lib/db";

const handler = NextAuth({
  adapter: PostgresAdapter(pool),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: "database",
  },
});

export { handler as GET, handler as POST };
