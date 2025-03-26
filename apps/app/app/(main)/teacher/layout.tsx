"use client";
import React from "react";
// Authorization
import { useAuth } from "@/hooks/useAuth";
import { AuthGuard } from "@/app/(auth)/AuthGuard";
import { UserDropdown } from "@/app/(auth)/UserDropdown";
// Next.js Components
import Link from "next/link";
// Shadcn UI
import { Container } from "@/components/container";
import { ModeToggle } from "@/components/mode-toggle";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard authRequired allowedRoles={["TEACHER"]} redirectTo="/student">
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <Container className="py-6">
            <div className="flex items-center justify-between">
              <Link href="/student" className="text-xl font-medium">
                Articles
              </Link>
              <div className="flex items-center space-x-2">
                <ModeToggle />
                <UserDropdown />
              </div>
            </div>
          </Container>
        </header>
        
        <main className="flex-1">
          {children}
        </main>
        
        <footer className="border-t bg-background mt-auto">
          <Container className="py-6">
            <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
              <div className="text-sm text-muted-foreground">
                © 2025 Articles. All rights reserved.
              </div>
              <nav>
                <ul className="flex flex-wrap gap-6 text-sm">
                  <li>
                    <Link
                      href="/terms"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Terms & Conditions
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/privacy"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cookies"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>
          </Container>
        </footer>
      </div>
    </AuthGuard>
  );
}