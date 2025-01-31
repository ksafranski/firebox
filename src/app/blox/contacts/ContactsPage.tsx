"use client";

import { useEffect, useState } from "react";
import {
  Typography,
  List,
  Button,
  Modal,
  Form,
  Input,
  Spin,
  message,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useTheme } from "../../providers";
import { IContactJSON } from "../../models/Contact";
import { Confirm } from "../../components/Confirm";
import { Container } from "../../components/Container";

const { Title, Text } = Typography;

export const ContactsPage = () => {
  const { isDarkMode } = useTheme();
  const [contacts, setContacts] = useState<IContactJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string>();
  const [editingContact, setEditingContact] = useState<IContactJSON | null>(
    null
  );
  const [form] = Form.useForm();

  const fetchContacts = async () => {
    try {
      const response = await fetch("/api/contacts");
      const data = await response.json();
      setContacts(data);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      message.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleSubmit = async (values: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  }) => {
    setLoading(true);
    try {
      const url = editingContact
        ? `/api/contacts/${editingContact._id}`
        : "/api/contacts";
      const method = editingContact ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to save contact");

      message.success(
        editingContact
          ? "Contact updated successfully"
          : "Contact created successfully"
      );
      setModalVisible(false);
      form.resetFields();
      fetchContacts();
    } catch (err) {
      console.error(
        `Error ${editingContact ? "updating" : "creating"} contact:`,
        err
      );
      message.error(
        `Failed to ${editingContact ? "update" : "create"} contact`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (contactId: string | undefined) => {
    if (!contactId) {
      message.error("Invalid contact ID");
      return;
    }
    setDeletingContactId(contactId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!deletingContactId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/contacts/${deletingContactId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete contact");

      message.success("Contact deleted successfully");
      fetchContacts();
    } catch (err) {
      console.error("Error deleting contact:", err);
      message.error("Failed to delete contact");
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setDeletingContactId(undefined);
    }
  };

  const showModal = (contact?: IContactJSON) => {
    if (contact) {
      setEditingContact(contact);
      form.setFieldsValue(contact);
    } else {
      setEditingContact(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  return (
    <Container>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Title level={2}>Contacts</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          New Contact
        </Button>
      </div>

      <Spin spinning={loading}>
        <List
          itemLayout="vertical"
          dataSource={contacts}
          renderItem={(contact) => (
            <List.Item
              style={{
                border: `1px solid ${isDarkMode ? "#424242" : "#d9d9d9"}`,
                borderRadius: "6px",
                padding: "16px",
                marginBottom: "16px",
              }}
              actions={[
                <Button
                  key="edit"
                  icon={<EditOutlined />}
                  onClick={() => showModal(contact)}
                >
                  Edit
                </Button>,
                <Button
                  key="delete"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(contact._id)}
                >
                  Delete
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span style={{ fontSize: "1.1em", fontWeight: 500 }}>
                    {contact.firstName} {contact.lastName}
                  </span>
                }
                description={
                  <div>
                    <Text>Email: {contact.email}</Text>
                    <br />
                    <Text>Phone: {contact.phoneNumber}</Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Spin>

      <Modal
        title={editingContact ? "Edit Contact" : "New Contact"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
        okText={editingContact ? "Update" : "Create"}
        cancelText="Cancel"
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
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Form.Item
            name="firstName"
            label="First Name"
            rules={[{ required: true, message: "Please enter first name" }]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Last Name"
            rules={[{ required: true, message: "Please enter last name" }]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input placeholder="Enter email address" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Phone Number"
            rules={[
              { required: true, message: "Please enter phone number" },
              {
                pattern: /^\+?[\d\s-()]+$/,
                message: "Please enter a valid phone number",
              },
            ]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Form>
      </Modal>

      <Confirm
        title="Delete Contact"
        content="Are you sure you want to delete this contact?"
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeletingContactId(undefined);
        }}
        onConfirm={confirmDelete}
        okText="Delete"
        loading={loading}
        danger
      />
    </Container>
  );
};
