import { MongoDBAdapter } from "../mongodb/adapter";
import { Book, IBook } from "../../models/Book";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "books";

export async function getBooks() {
  const adapter = new MongoDBAdapter();
  await adapter.connect();

  try {
    const books = await adapter.find<IBook>(COLLECTION_NAME, {});
    return books.map((book) => new Book(book).toJSON());
  } finally {
    await adapter.disconnect();
  }
}

export async function getBook(id: string) {
  const adapter = new MongoDBAdapter();
  await adapter.connect();

  try {
    const book = await adapter.findOne<IBook>(COLLECTION_NAME, {
      _id: new ObjectId(id),
    });
    return book ? new Book(book).toJSON() : null;
  } finally {
    await adapter.disconnect();
  }
}

export async function createBook(
  bookData: Omit<IBook, "_id" | "createdAt" | "updatedAt">
) {
  const adapter = new MongoDBAdapter();
  await adapter.connect();

  try {
    const now = new Date();
    const book = new Book({
      ...bookData,
      createdAt: now,
      updatedAt: now,
    });
    const result = await adapter.insertOne<IBook>(COLLECTION_NAME, book);
    return new Book(result).toJSON();
  } finally {
    await adapter.disconnect();
  }
}

export async function updateBook(id: string, bookData: Partial<IBook>) {
  const adapter = new MongoDBAdapter();
  await adapter.connect();

  try {
    const book = await adapter.findOne<IBook>(COLLECTION_NAME, {
      _id: new ObjectId(id),
    });

    if (!book) {
      throw new Error("Book not found");
    }

    const updatedBook = {
      ...bookData,
      updatedAt: new Date(),
    };

    await adapter.updateOne<IBook>(
      COLLECTION_NAME,
      { _id: new ObjectId(id) },
      updatedBook
    );

    return { success: true };
  } finally {
    await adapter.disconnect();
  }
}

export async function deleteBook(id: string) {
  const adapter = new MongoDBAdapter();
  await adapter.connect();

  try {
    const result = await adapter.deleteOne<IBook>(COLLECTION_NAME, {
      _id: new ObjectId(id),
    });
    return { success: result };
  } finally {
    await adapter.disconnect();
  }
}
