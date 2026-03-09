import { TranscriptionContainer } from "@/features/transcription/ui/container/TranscriptionContainer";
import { LogoutButton } from "@/components/authUI/LogoutButton";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { getUserCredits } from "@/services/credits/getCreditsAction";
import { UserHeader } from "@/components/authUI/UserHeader";

export default async function Page() {
  const session = await getServerSession(authOptions);

  let credits = 0;
  let hasCredits = false;

  // Obtener créditos en el servidor (sin parpadeo)
  if (session?.user?.id) {
    const result = await getUserCredits();
    if (result.success) {
      credits = result.credits;
      hasCredits = result.hasCredits;
    }
  }

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header>
        <UserHeader
          email={session?.user?.email}
          credits={credits}
          hasCredits={hasCredits}
        />
      </header>
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <TranscriptionContainer hasCredits={hasCredits} credits={credits} />
      </main>
      <footer className="row-start-3 flex flex-wrap items-center justify-center">
        <LogoutButton />
      </footer>
    </div>
  );
}
