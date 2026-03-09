import { TranscriptionContainer } from "@/features/transcription/ui/container/TranscriptionContainer";
import { LogoutButton } from "@/components/authUI/LogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getUserCredits } from "@/services/credits/getCreditsAction";
import { UserHeader } from "@/components/authUI/UserHeader";

export default async function Page() {
  const session = await getServerSession(authOptions);

  // 👉 Datos por defecto si no hay sesión
  let creditsData = {
    credits: 0,
    hasCredits: false,
    plan: 'free',
    usedThisMonth: 0,
    includedThisMonth: 0
  };

  // Obtener créditos en el servidor (sin parpadeo inicial)
  if (session?.user?.id) {
    const result = await getUserCredits();
    if (result.success) {
      creditsData = {
        credits: result.credits,
        hasCredits: result.hasCredits,
        plan: result.plan,
        usedThisMonth: result.usedThisMonth,
        includedThisMonth: result.includedThisMonth
      };
    }
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header>
        {/* 👉 Pasamos datos iniciales al Client Component */}
        <UserHeader
          email={session?.user?.email}
          initialCredits={creditsData.credits}
          initialHasCredits={creditsData.hasCredits}
          plan={creditsData.plan}
          usedThisMonth={creditsData.usedThisMonth}
          includedThisMonth={creditsData.includedThisMonth}
        />
      </header>
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        {/* 👉 El container recibe props simples, luego usa eventos globales */}
        <TranscriptionContainer 
          hasCredits={creditsData.hasCredits} 
          credits={creditsData.credits}
        />
      </main>
      <footer className="row-start-3 flex flex-wrap items-center justify-center">
        <LogoutButton />
      </footer>
    </div>
  );
}