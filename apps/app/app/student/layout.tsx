"use client";

import React from "react";
import { AuthGuard } from "@/app/(auth)/AuthGuard";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard authRequired={true} redirectTo="/sign-in">
      {children}
    </AuthGuard>
  );
}