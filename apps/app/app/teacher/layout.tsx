"use client";
import React from "react";

// Authorization
import { AuthGuard } from "@/app/(auth)/AuthGuard";
import { ProfileDropdown } from "../(auth)/ProfileDropdown";

// Shadcn/UI Components
import { ModeToggle } from "@/components/mode-toggle";
import { Container } from "@/components/container";

// Next.js Components
import Link from "next/link";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard authRequired allowedRoles={["TEACHER"]} redirectTo="/sign-in">
        <div className="flex min-h-screen flex-col">
            <header className="border-b py-4">
                <Container className="flex items-center justify-between">
                    <Link href="/teacher" className="text-xl">
                        Articles
                    </Link>
                    <div className="flex gap-2">
                        <ModeToggle />
                        <ProfileDropdown />
                    </div>
                </Container>
            </header>
            <main className="flex-1">
                {children}
            </main>
            <footer className="border-t py-6 mt-auto">
                <Container>
                    <div className="flex flex-col md:flex-row md:justify-between items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                            © 2025 Articles. All rights reserved.
                        </div>
                        <div className="flex gap-4 text-sm">
                        <Link 
                            href="/terms" 
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Terms & Conditions
                        </Link>
                        <Link 
                            href="/privacy" 
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Privacy Policy
                        </Link>
                        <Link 
                            href="/cookies" 
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cookie Policy
                        </Link>
                        </div>
                    </div>
                </Container>
            </footer>
        </div>
    </AuthGuard>
  );
}