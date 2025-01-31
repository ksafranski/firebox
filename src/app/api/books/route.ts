import { NextRequest, NextResponse } from "next/server";
import {
  getBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} from "../../blox/books/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const book = await getBook(id);
      if (!book) {
        return NextResponse.json({ error: "Book not found" }, { status: 404 });
      }
      return NextResponse.json(book);
    }

    const books = await getBooks();
    return NextResponse.json(books);
  } catch (error) {
    console.error("Error in GET /api/books:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookData = await request.json();
    const book = await createBook(bookData);
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/books:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    const bookData = await request.json();
    const result = await updateBook(id, bookData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in PUT /api/books:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Book ID is required" },
        { status: 400 }
      );
    }

    const result = await deleteBook(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in DELETE /api/books:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
