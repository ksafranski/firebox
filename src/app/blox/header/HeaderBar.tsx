"use client";

import { Layout, Switch, Space } from "antd";
import {
  HomeOutlined,
  SunOutlined,
  MoonOutlined,
  FileTextOutlined,
  ContactsOutlined,
  BookOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useTheme } from "../../providers";
import styles from "./HeaderBar.module.css";

export const HeaderBar = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Layout.Header
      style={{
        position: "fixed",
        top: 0,
        zIndex: 1,
        width: "100%",
        background: isDarkMode ? "rgb(36, 52, 73)" : "#425D83",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "3em",
      }}
    >
      <div className={styles.spacer} />
      <Space size={0} className={styles.navContainer}>
        <Link href="/" className={styles.navItem}>
          <HomeOutlined />
        </Link>
        <Link href="/notes" className={styles.navItem}>
          <FileTextOutlined />
        </Link>
        <Link href="/contacts" className={styles.navItem}>
          <ContactsOutlined />
        </Link>
        <Link href="/books" className={styles.navItem}>
          <BookOutlined />
        </Link>
      </Space>
      <div className={styles.rightAlignedSpacer}>
        <Switch
          checked={isDarkMode}
          onChange={toggleTheme}
          checkedChildren={<MoonOutlined style={{ color: "#ffffff" }} />}
          unCheckedChildren={<SunOutlined style={{ color: "#ffffff" }} />}
        />
      </div>
    </Layout.Header>
  );
};
