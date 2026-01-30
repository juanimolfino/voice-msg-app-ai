import { TranscriptionContainer } from "@/features/transcription/ui/container/TranscriptionContainer";
import { LogoutButton } from "@/components/authUI/LogoutButton";
import { UserGreeting } from "@/components/authUI/UserGreeting";

export default function Page() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <header>
        <UserGreeting />
      </header>
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <TranscriptionContainer />
      </main>
      <footer className="row-start-3 flex flex-wrap items-center justify-center">
        <LogoutButton />
      </footer>
    </div>
  );
}
