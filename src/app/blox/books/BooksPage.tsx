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
  Select,
  InputNumber,
  Tabs,
  Switch,
  Space,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useTheme } from "../../providers";
import { IBookJSON } from "../../models/Book";
import { Confirm } from "../../components/Confirm";
import { Container } from "../../components/Container";
import { generateOnix } from "../../utils/onixGenerator";

const { Title, Text } = Typography;
const { TextArea } = Input;

const currencyOptions = [
  { value: "USD", label: "US Dollar" },
  { value: "EUR", label: "Euro" },
  { value: "GBP", label: "British Pound" },
  { value: "CAD", label: "Canadian Dollar" },
  { value: "AUD", label: "Australian Dollar" },
];

const dimensionUnits = [
  { value: "mm", label: "Millimeters" },
  { value: "cm", label: "Centimeters" },
  { value: "in", label: "Inches" },
];

const weightUnits = [
  { value: "g", label: "Grams" },
  { value: "kg", label: "Kilograms" },
  { value: "oz", label: "Ounces" },
  { value: "lb", label: "Pounds" },
];

const printTypes = [
  { value: "Offset", label: "Offset" },
  { value: "Digital", label: "Digital" },
  { value: "Print on Demand", label: "Print on Demand" },
];

const bindingMethods = [
  { value: "Perfect", label: "Perfect Binding" },
  { value: "Case", label: "Case Binding" },
  { value: "Saddle Stitch", label: "Saddle Stitch" },
  { value: "Spiral", label: "Spiral Binding" },
  { value: "Wire-O", label: "Wire-O Binding" },
];

const bookStatuses = [
  { value: "Announced", label: "Announced" },
  { value: "Forthcoming", label: "Forthcoming" },
  { value: "Active", label: "Active" },
  { value: "Out of Print", label: "Out of Print" },
];

export const BooksPage = () => {
  const { isDarkMode } = useTheme();
  const [books, setBooks] = useState<IBookJSON[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState<string>();
  const [editingBook, setEditingBook] = useState<IBookJSON | null>(null);
  const [onixModalVisible, setOnixModalVisible] = useState(false);
  const [onixContent, setOnixContent] = useState<string>("");
  const [form] = Form.useForm();

  const fetchBooks = async () => {
    try {
      const response = await fetch("/api/books");
      const data = await response.json();
      setBooks(data);
    } catch (err) {
      console.error("Error fetching books:", err);
      message.error("Failed to fetch books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSubmit = async (values: Partial<IBookJSON>) => {
    setLoading(true);
    try {
      // Ensure the publishDate is in ISO format
      const formattedValues = {
        ...values,
        publishDate: new Date(values.publishDate as string).toISOString(),
      };

      const url = editingBook?._id
        ? `/api/books?id=${editingBook._id}`
        : "/api/books";
      const method = editingBook ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) throw new Error("Failed to save book");

      message.success(
        editingBook ? "Book updated successfully" : "Book added successfully"
      );
      setModalVisible(false);
      form.resetFields();
      fetchBooks();
    } catch (err) {
      console.error(
        `Error ${editingBook ? "updating" : "creating"} book:`,
        err
      );
      message.error(`Failed to ${editingBook ? "update" : "create"} book`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (bookId: string | undefined) => {
    if (!bookId) {
      message.error("Invalid book ID");
      return;
    }
    setDeletingBookId(bookId);
    setDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!deletingBookId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/books?id=${deletingBookId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete book");

      message.success("Book deleted successfully");
      fetchBooks();
    } catch (err) {
      console.error("Error deleting book:", err);
      message.error("Failed to delete book");
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
      setDeletingBookId(undefined);
    }
  };

  const showModal = (book?: IBookJSON) => {
    if (book) {
      setEditingBook(book);
      // Format the date to YYYY-MM-DD for the date input
      const formattedBook = {
        ...book,
        publishDate: new Date(book.publishDate).toISOString().split("T")[0],
      };
      form.setFieldsValue(formattedBook);
    } else {
      setEditingBook(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const showOnixModal = (book: IBookJSON) => {
    const onixXml = generateOnix(book);
    setOnixContent(onixXml);
    setOnixModalVisible(true);
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
        <Title level={2}>Books</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => showModal()}
        >
          Add Book
        </Button>
      </div>

      <Spin spinning={loading}>
        <List
          itemLayout="vertical"
          dataSource={books}
          renderItem={(book) => (
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
                  onClick={() => showModal(book)}
                >
                  Edit
                </Button>,
                <Button
                  key="onix"
                  icon={<FileTextOutlined />}
                  onClick={() => showOnixModal(book)}
                >
                  ONIX
                </Button>,
                <Button
                  key="delete"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDelete(book._id)}
                >
                  Delete
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={
                  <span style={{ fontSize: "1.1em", fontWeight: 500 }}>
                    {book.title}
                    {book.subtitle && (
                      <Text type="secondary" style={{ marginLeft: 8 }}>
                        {book.subtitle}
                      </Text>
                    )}
                  </span>
                }
                description={
                  <div>
                    <Text>By: {book.authors.join(", ")}</Text>
                    <br />
                    <Text>ISBN: {book.isbn13}</Text>
                    <br />
                    <Text>
                      Published:{" "}
                      {new Date(book.publishDate).toLocaleDateString()} by{" "}
                      {book.publisher}
                    </Text>
                    <br />
                    <Text>
                      {book.pageCount} pages • {book.format} •{" "}
                      {book.genre.join(", ")}
                    </Text>
                  </div>
                }
              />
              <div style={{ marginTop: 16 }}>
                <Text>{book.description}</Text>
              </div>
            </List.Item>
          )}
        />
      </Spin>

      <Modal
        title={editingBook ? "Edit Book" : "Add New Book"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={form.submit}
        okText={editingBook ? "Update" : "Add"}
        cancelText="Cancel"
        confirmLoading={loading}
        width={1200}
        maskClosable={false}
        keyboard={false}
        styles={{
          header: {
            marginBottom: "1em",
          },
          body: {
            maxHeight: "75vh",
            overflow: "auto",
            padding: "0 32px 32px",
          },
          footer: {
            marginTop: "1em",
          },
        }}
      >
        <Form form={form} onFinish={handleSubmit} layout="vertical">
          <Tabs
            defaultActiveKey="basic"
            items={[
              {
                key: "basic",
                label: "Basic Information",
                children: (
                  <div>
                    <Form.Item
                      name="isbn13"
                      label="ISBN-13"
                      rules={[
                        { required: true, message: "Please enter ISBN-13" },
                        {
                          pattern: /^[0-9]{13}$/,
                          message: "Please enter a valid 13-digit ISBN",
                        },
                      ]}
                    >
                      <Input placeholder="Enter ISBN-13" />
                    </Form.Item>

                    <Form.Item name="isbn10" label="ISBN-10">
                      <Input placeholder="Enter ISBN-10 (optional)" />
                    </Form.Item>

                    <Form.Item
                      name="title"
                      label="Title"
                      rules={[
                        { required: true, message: "Please enter title" },
                      ]}
                    >
                      <Input placeholder="Enter book title" />
                    </Form.Item>

                    <Form.Item name="subtitle" label="Subtitle">
                      <Input placeholder="Enter subtitle (optional)" />
                    </Form.Item>

                    <Form.Item
                      name="authors"
                      label="Authors"
                      rules={[
                        {
                          required: true,
                          message: "Please enter at least one author",
                        },
                      ]}
                    >
                      <Select
                        mode="tags"
                        placeholder="Enter authors"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="description"
                      label="Description"
                      rules={[
                        { required: true, message: "Please enter description" },
                      ]}
                    >
                      <TextArea
                        rows={4}
                        placeholder="Enter book description"
                        style={{ minHeight: 120 }}
                      />
                    </Form.Item>

                    <Form.Item name="coverImage" label="Cover Image URL">
                      <Input placeholder="Enter cover image URL (optional)" />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: "publishing",
                label: "Publishing Details",
                children: (
                  <div>
                    <Form.Item
                      name="publisher"
                      label="Publisher"
                      rules={[
                        { required: true, message: "Please enter publisher" },
                      ]}
                    >
                      <Input placeholder="Enter publisher" />
                    </Form.Item>

                    <Form.Item name="imprint" label="Imprint">
                      <Input placeholder="Enter imprint (optional)" />
                    </Form.Item>

                    <Form.Item
                      name="publishDate"
                      label="Publication Date"
                      rules={[
                        {
                          required: true,
                          message: "Please enter publication date",
                        },
                      ]}
                    >
                      <Input type="date" />
                    </Form.Item>

                    <Space style={{ display: "flex", gap: 16 }}>
                      <Form.Item
                        name="publicationCity"
                        label="Publication City"
                      >
                        <Input placeholder="Enter city" />
                      </Form.Item>

                      <Form.Item
                        name="publicationCountry"
                        label="Publication Country"
                      >
                        <Input placeholder="Enter country" />
                      </Form.Item>
                    </Space>

                    <Form.Item
                      name="status"
                      label="Status"
                      initialValue="Active"
                    >
                      <Select options={bookStatuses} />
                    </Form.Item>

                    <Form.Item name="edition" label="Edition">
                      <Input placeholder="Enter edition (optional)" />
                    </Form.Item>

                    <Form.Item name="printRun" label="Print Run">
                      <InputNumber
                        min={0}
                        placeholder="Enter print run"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    <Form.Item name="rights" label="Rights">
                      <Select
                        mode="tags"
                        placeholder="Enter rights information"
                      />
                    </Form.Item>

                    <Space style={{ display: "flex", gap: 16 }}>
                      <Form.Item name="copyrightYear" label="Copyright Year">
                        <InputNumber
                          placeholder="Year"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>

                      <Form.Item
                        name="copyrightHolder"
                        label="Copyright Holder"
                      >
                        <Input placeholder="Enter copyright holder" />
                      </Form.Item>
                    </Space>
                  </div>
                ),
              },
              {
                key: "physical",
                label: "Physical Details",
                children: (
                  <div>
                    <Form.Item
                      name="format"
                      label="Format"
                      rules={[
                        { required: true, message: "Please select format" },
                      ]}
                    >
                      <Select placeholder="Select format">
                        <Select.Option value="Hardcover">
                          Hardcover
                        </Select.Option>
                        <Select.Option value="Paperback">
                          Paperback
                        </Select.Option>
                        <Select.Option value="eBook">eBook</Select.Option>
                        <Select.Option value="Audiobook">
                          Audiobook
                        </Select.Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name={["dimensions", "unit"]}
                      label="Dimensions Unit"
                      initialValue="mm"
                    >
                      <Select options={dimensionUnits} />
                    </Form.Item>

                    <Space style={{ display: "flex", gap: 16 }}>
                      <Form.Item name={["dimensions", "height"]} label="Height">
                        <InputNumber
                          placeholder="Height"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>

                      <Form.Item name={["dimensions", "width"]} label="Width">
                        <InputNumber
                          placeholder="Width"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>

                      <Form.Item name={["dimensions", "depth"]} label="Depth">
                        <InputNumber
                          placeholder="Depth"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>
                    </Space>

                    <Space style={{ display: "flex", gap: 16 }}>
                      <Form.Item name={["weight", "value"]} label="Weight">
                        <InputNumber
                          placeholder="Weight"
                          style={{ width: "100%" }}
                        />
                      </Form.Item>

                      <Form.Item
                        name={["weight", "unit"]}
                        label="Weight Unit"
                        initialValue="g"
                      >
                        <Select options={weightUnits} style={{ width: 120 }} />
                      </Form.Item>
                    </Space>

                    <Form.Item
                      name="pageCount"
                      label="Page Count"
                      rules={[{ required: true }]}
                    >
                      <InputNumber
                        min={1}
                        placeholder="Enter page count"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    <Form.Item name="paperStock" label="Paper Stock">
                      <Input placeholder="Enter paper stock type" />
                    </Form.Item>

                    <Form.Item name="bindingMethod" label="Binding Method">
                      <Select
                        options={bindingMethods}
                        placeholder="Select binding method"
                      />
                    </Form.Item>

                    <Form.Item name="printType" label="Print Type">
                      <Select
                        options={printTypes}
                        placeholder="Select print type"
                      />
                    </Form.Item>

                    <Form.Item
                      name="color"
                      label="Color Printing"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: "marketing",
                label: "Marketing & Sales",
                children: (
                  <div>
                    <Form.Item name="audience" label="Target Audience">
                      <Select
                        mode="tags"
                        placeholder="Enter target audience groups"
                      />
                    </Form.Item>

                    <Space style={{ display: "flex", gap: 16 }}>
                      <Form.Item name={["ageRange", "min"]} label="Min Age">
                        <InputNumber placeholder="Min age" />
                      </Form.Item>

                      <Form.Item name={["ageRange", "max"]} label="Max Age">
                        <InputNumber placeholder="Max age" />
                      </Form.Item>
                    </Space>

                    <Form.Item name="readingLevel" label="Reading Level">
                      <Input placeholder="Enter reading level" />
                    </Form.Item>

                    <Form.Item name="bisacCodes" label="BISAC Codes">
                      <Select mode="tags" placeholder="Enter BISAC codes" />
                    </Form.Item>

                    <Form.Item name="keywords" label="Keywords">
                      <Select mode="tags" placeholder="Enter keywords" />
                    </Form.Item>

                    <Form.Item name="marketingText" label="Marketing Text">
                      <TextArea rows={4} placeholder="Enter marketing text" />
                    </Form.Item>

                    <Form.List name="reviewQuotes">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Space
                              key={key}
                              style={{ display: "flex", marginBottom: 8 }}
                              align="baseline"
                            >
                              <Form.Item
                                {...restField}
                                name={[name, "quote"]}
                                rules={[
                                  { required: true, message: "Missing quote" },
                                ]}
                              >
                                <TextArea placeholder="Review quote" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "author"]}
                                rules={[
                                  { required: true, message: "Missing author" },
                                ]}
                              >
                                <Input placeholder="Author" />
                              </Form.Item>
                              <Form.Item {...restField} name={[name, "source"]}>
                                <Input placeholder="Source" />
                              </Form.Item>
                              <Form.Item {...restField} name={[name, "date"]}>
                                <Input type="date" />
                              </Form.Item>
                              <Button onClick={() => remove(name)} danger>
                                Delete
                              </Button>
                            </Space>
                          ))}
                          <Form.Item>
                            <Button type="dashed" onClick={() => add()} block>
                              Add Review Quote
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>

                    <Form.List name="awards">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Space
                              key={key}
                              style={{ display: "flex", marginBottom: 8 }}
                              align="baseline"
                            >
                              <Form.Item
                                {...restField}
                                name={[name, "name"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Missing award name",
                                  },
                                ]}
                              >
                                <Input placeholder="Award name" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "year"]}
                                rules={[
                                  { required: true, message: "Missing year" },
                                ]}
                              >
                                <InputNumber placeholder="Year" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "category"]}
                              >
                                <Input placeholder="Category" />
                              </Form.Item>
                              <Button onClick={() => remove(name)} danger>
                                Delete
                              </Button>
                            </Space>
                          ))}
                          <Form.Item>
                            <Button type="dashed" onClick={() => add()} block>
                              Add Award
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  </div>
                ),
              },
              {
                key: "commercial",
                label: "Commercial Details",
                children: (
                  <div>
                    <Space style={{ display: "flex", gap: 16 }}>
                      <Form.Item name={["price", "value"]} label="Price">
                        <InputNumber
                          placeholder="Enter price"
                          precision={2}
                          min={0}
                          style={{ width: "100%" }}
                        />
                      </Form.Item>

                      <Form.Item
                        name={["price", "currency"]}
                        label="Currency"
                        initialValue="USD"
                      >
                        <Select
                          options={currencyOptions}
                          style={{ width: 120 }}
                        />
                      </Form.Item>
                    </Space>

                    <Form.Item name="discountCode" label="Discount Code">
                      <Input placeholder="Enter discount code" />
                    </Form.Item>

                    <Form.Item
                      name="returnable"
                      label="Returnable"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>

                    <Form.List name="distributors">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map(({ key, name, ...restField }) => (
                            <Space
                              key={key}
                              style={{ display: "flex", marginBottom: 8 }}
                              align="baseline"
                            >
                              <Form.Item
                                {...restField}
                                name={[name, "name"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Missing distributor name",
                                  },
                                ]}
                              >
                                <Input placeholder="Distributor name" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "territory"]}
                                rules={[
                                  {
                                    required: true,
                                    message: "Missing territory",
                                  },
                                ]}
                              >
                                <Input placeholder="Territory" />
                              </Form.Item>
                              <Form.Item
                                {...restField}
                                name={[name, "exclusive"]}
                                valuePropName="checked"
                              >
                                <Switch
                                  checkedChildren="Exclusive"
                                  unCheckedChildren="Non-exclusive"
                                />
                              </Form.Item>
                              <Button onClick={() => remove(name)} danger>
                                Delete
                              </Button>
                            </Space>
                          ))}
                          <Form.Item>
                            <Button type="dashed" onClick={() => add()} block>
                              Add Distributor
                            </Button>
                          </Form.Item>
                        </>
                      )}
                    </Form.List>
                  </div>
                ),
              },
              {
                key: "digital",
                label: "Digital Details",
                children: (
                  <div>
                    <Form.Item
                      name={["digitalRights", "drm"]}
                      label="DRM Protected"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>

                    <Form.Item
                      name={["digitalRights", "territories"]}
                      label="Available Territories"
                    >
                      <Select mode="tags" placeholder="Enter territories" />
                    </Form.Item>

                    <Form.Item
                      name={["digitalRights", "restrictions"]}
                      label="Restrictions"
                    >
                      <Select mode="tags" placeholder="Enter restrictions" />
                    </Form.Item>

                    <Form.Item name="fileSize" label="File Size (KB)">
                      <InputNumber
                        min={0}
                        placeholder="Enter file size"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>

                    <Form.Item name="wordCount" label="Word Count">
                      <InputNumber
                        min={0}
                        placeholder="Enter word count"
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  </div>
                ),
              },
            ]}
          />
        </Form>
      </Modal>

      <Confirm
        title="Delete Book"
        content="Are you sure you want to delete this book?"
        open={deleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeletingBookId(undefined);
        }}
        onConfirm={confirmDelete}
        okText="Delete"
        loading={loading}
        danger
      />

      <Modal
        title="ONIX 3.0 XML"
        open={onixModalVisible}
        onCancel={() => setOnixModalVisible(false)}
        width={800}
        footer={[
          <Button
            key="copy"
            onClick={() => {
              navigator.clipboard.writeText(onixContent);
              message.success("ONIX XML copied to clipboard");
            }}
          >
            Copy to Clipboard
          </Button>,
          <Button
            key="close"
            type="primary"
            onClick={() => setOnixModalVisible(false)}
          >
            Close
          </Button>,
        ]}
      >
        <div
          style={{
            maxHeight: "60vh",
            overflow: "auto",
            backgroundColor: isDarkMode ? "#1f1f1f" : "#f5f5f5",
            padding: "16px",
            borderRadius: "4px",
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {onixContent}
        </div>
      </Modal>
    </Container>
  );
};
