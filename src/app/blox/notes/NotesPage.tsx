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
import { INoteJSON } from "../../models/Note";
import { Confirm } from "../../components/Confirm";
import { Container } from "../../components/Container";

const { Title, Text } = Typography;
const { TextArea } = Input;

export const NotesPage = () => {
  const { isDarkMode } = useTheme();
  const [notes, setNotes] = useState<INoteJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState<string>();
  const [editingNote, setEditingNote] = useState<INoteJSON | null>(null);
  const [form] = Form.useForm();

  const fetchNotes = async () => {
    try {
      const response = await fetch("/api/notes");
      const data = await response.json();
      console.log("Fetched notes:", data);
      setNotes(data);
    } catch (err) {
      console.error("Error fetching notes:", err);
      message.error("Failed to fetch notes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const handleSubmit = async (values: { title: string; content: string }) => {
    setLoading(true);
    try {
      const url = editingNote ? `/api/notes/${editingNote._id}` : "/api/notes";
      const method = editingNote ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error("Failed to save note");

      message.success(
        editingNote ? "Note updated successfully" : "Note created successfully"
      );
      setModalVisible(false);
      form.resetFields();
      fetchNotes();
    } catch (err) {
      console.error(
        `Error ${editingNote ? "updating" : "creating"} note:`,
        err
      );
      message.error(`Failed to ${editingNote ? "update" : "create"} note`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string | undefined) => {
    if (!noteId) {
      message.error("Invalid note ID");
      return;
    }
    setDeletingNoteId(noteId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!deletingNoteId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/notes/${deletingNoteId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete note");

      message.success("Note deleted successfully");
      fetchNotes();
    } catch (err) {
      console.error("Error deleting note:", err);
      message.error("Failed to delete note");
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setDeletingNoteId(undefined);
    }
  };

  const showModal = (note?: INoteJSON) => {
    if (note) {
      setEditingNote(note);
      form.setFieldsValue(note);
    } else {
      setEditingNote(null);
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
        <Title level={2}>Notes</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          New Note
        </Button>
      </div>

      <Spin spinning={loading}>
        <List
          itemLayout="vertical"
          dataSource={notes}
          renderItem={(note) => (
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
                  onClick={() => showModal(note)}
                >
                  Edit
                </Button>,
                <Button
                  key="delete"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(note._id)}
                >
                  Delete
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span style={{ fontSize: "1.1em", fontWeight: 500 }}>
                    {note.title}
                  </span>
                }
                description={
                  <div>
                    <Text type="secondary">
                      Created: {new Date(note.createdAt).toLocaleString()}
                    </Text>
                    <br />
                    <Text type="secondary">
                      Last edited: {new Date(note.updatedAt).toLocaleString()}
                    </Text>
                  </div>
                }
              />
              {note.content}
            </List.Item>
          )}
        />
      </Spin>

      <Modal
        title={editingNote ? "Edit Note" : "New Note"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
        okText={editingNote ? "Update" : "Create"}
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
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter note title" />
          </Form.Item>

          <Form.Item
            name="content"
            label="Content"
            rules={[{ required: true, message: "Please enter content" }]}
            style={{ marginBottom: 0 }}
          >
            <TextArea
              rows={4}
              placeholder="Enter note content"
              style={{ minHeight: 120 }}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Confirm
        title="Delete Note"
        content="Are you sure you want to delete this note?"
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeletingNoteId(undefined);
        }}
        onConfirm={confirmDelete}
        okText="Delete"
        loading={loading}
        danger
      />
    </Container>
  );
};
