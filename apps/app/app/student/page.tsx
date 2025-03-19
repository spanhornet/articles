"use client";

import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/app/(auth)/AuthProvider";
import { LogOut } from "lucide-react";

export default function Page() {
  const { signOut, user } = useAuthContext();

  const handleSignOut = async () => {
    await signOut();
    // Optionally redirect after sign out
    window.location.href = "/sign-in";
  };

  return (
    <div className="space-y-6">
      <UserGreeting />
      <div className="space-y-4">
        {user && (
          <Button 
            onClick={handleSignOut} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        )}
      </div>
    </div>
  );
}

export function UserGreeting() {
    const { user, loading } = useAuthContext();
  
    // Show loading state while authentication status is being determined
    if (loading) {
      return <p className="text-muted-foreground">Loading...</p>;
    }
  
    // Conditional rendering based on authentication status
    return (
      <div className="p-4 border rounded-md bg-background">
        {user ? (
          <p className="text-xl font-medium">
            Hi, <span className="font-semibold">{user.name}</span>! 👋
          </p>
        ) : (
          <p className="text-xl text-muted-foreground">
            You are not logged in.
          </p>
        )}
      </div>
    );
  }