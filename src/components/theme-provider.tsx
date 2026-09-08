"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export const ThemeProvider = ({ children }: React.ComponentProps<typeof NextThemesProvider>) => (
  <NextThemesProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
    {children}
  </NextThemesProvider>
);
