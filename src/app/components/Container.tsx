"use client";

import { ReactNode } from "react";
import { useTheme } from "../providers";

interface ContainerProps {
  children: ReactNode;
}

export const Container = ({ children }: ContainerProps) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "24px",
        paddingTop: "calc(88px + 3em)",
        background: isDarkMode ? "#141414" : "#ffffff",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {children}
      </div>
    </div>
  );
};
