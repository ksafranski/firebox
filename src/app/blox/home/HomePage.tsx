"use client";

import { Typography } from "antd";
import { useTheme } from "../../providers";

const { Title } = Typography;

export const HomePage = () => {
  const { isDarkMode } = useTheme();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: isDarkMode ? "#141414" : "#ffffff",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Title level={1}>Hello Blox!</Title>
      </div>
    </div>
  );
};
