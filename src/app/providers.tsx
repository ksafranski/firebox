"use client";

import "@ant-design/v5-patch-for-react-19";
import { ConfigProvider, theme } from "antd";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: (checked: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function Providers({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    setIsDarkMode(savedTheme === "dark");
  }, []);

  const toggleTheme = (checked: boolean) => {
    setIsDarkMode(checked);
    localStorage.setItem("theme", checked ? "dark" : "light");
  };

  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    components: {
      Input: {
        paddingBlock: 8,
        paddingInline: 12,
      },
      TextArea: {
        paddingBlock: 8,
        paddingInline: 12,
      },
      Button: {
        paddingContentVertical: 4,
        paddingContentHorizontal: 15,
        onlyIconSize: 16,
        defaultShadow: "none",
        primaryShadow: "none",
        dangerShadow: "none",
      },
      Modal: {
        marginXS: 32,
        maskClosable: false,
      },
      Typography: {
        fontWeightStrong: 500,
      },
    },
    token: {
      borderRadius: 6,
      controlHeight: 32,
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
      colorBorderSecondary: isDarkMode ? "#303030" : "#f0f0f0",
      fontFamily: "var(--font-urbanist)",
      letterSpacing: "0.1em",
      colorPrimary: "#5375A4",
      // Derived colors for a cohesive theme
      colorPrimaryHover: "#6587B6",
      colorPrimaryActive: "#456393",
      colorPrimaryBg: "#F0F5FA",
      colorPrimaryBgHover: "#E1EAF4",
    },
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
    </ThemeContext.Provider>
  );
}
