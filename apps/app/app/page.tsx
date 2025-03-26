// Shadcn UI
import { ModeToggle } from "@/components/mode-toggle";

// AuthGuard
import { AuthGuard } from "@/app/(auth)/AuthGuard";

export default function Home() {
  return (
   <AuthGuard authRequired redirectTo="/sign-in">
    <div>
      <ModeToggle />
    </div>
   </AuthGuard>
  );
}
