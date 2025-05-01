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
    <AuthGuard authRequired allowedRoles={["STUDENT", "TEACHER"]} redirectTo="/sign-in">
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}