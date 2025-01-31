import { NextResponse } from "next/server";
import { getNotes, createNote } from "@/app/blox/notes/api";
import { INote } from "@/app/models/Note";

export async function GET() {
  try {
    const notes = await getNotes();
    return NextResponse.json(notes.map((note) => note.toJSON()));
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as Partial<INote>;
    const note = await createNote(data);
    return NextResponse.json(note.toJSON(), { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}
