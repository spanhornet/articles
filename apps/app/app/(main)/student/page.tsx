"use client";

import { useAuthContext } from "@/app/(auth)/AuthProvider";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { AuthGuard } from "@/app/(auth)/AuthGuard";

// Next.js Hooks
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const { user, signOut } = useAuthContext();

  console.log(user);

  const handleSignOut = async () => {
    await signOut();
    router.push('/sign-in');
  }

  return (
    <AuthGuard authRequired redirectTo="/sign-in">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">
            Hi {user?.firstName || user?.name?.split(' ')[0] || 'there'}!
          </h1>
          
          <Button 
            variant="outline" 
            onClick={handleSignOut}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LogOut size={16} />
            Sign out
          </Button>
        </div>
        
        <div className="p-6 border rounded-lg bg-card">
          <p>Welcome to your dashboard</p>
        </div>
      </div>
    </AuthGuard>
  );
}