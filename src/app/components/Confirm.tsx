"use client";

import { Modal } from "antd";
import { ReactNode } from "react";

interface ConfirmProps {
  title: string;
  content: ReactNode;
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  okText?: string;
  cancelText?: string;
  loading?: boolean;
  danger?: boolean;
}

export const Confirm = ({
  title,
  content,
  open,
  onConfirm,
  onCancel,
  okText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  danger = false,
}: ConfirmProps) => {
  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText={okText}
      cancelText={cancelText}
      okButtonProps={{ danger }}
      confirmLoading={loading}
      maskClosable={false}
      keyboard={false}
      styles={{
        header: {
          marginBottom: "2em",
        },
        footer: {
          marginTop: "2em",
        },
      }}
    >
      {content}
    </Modal>
  );
};
