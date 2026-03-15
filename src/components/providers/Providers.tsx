"use client";

import { type ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { QueryProvider } from "./QueryProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryProvider>
  );
}
