import { MongoDBAdapter } from "../mongodb/adapter";
import { Note, INote } from "../../models/Note";
import { ObjectId } from "mongodb";

const db = new MongoDBAdapter();
const COLLECTION = "notes";

export async function getNotes() {
  await db.connect();
  const notes = await db.find<INote>(COLLECTION, {});
  return notes.map((note) => new Note(note));
}

export async function getNote(id: string) {
  await db.connect();
  const note = await db.findOne<INote>(COLLECTION, { _id: new ObjectId(id) });
  return note ? new Note(note) : null;
}

export async function createNote(data: Partial<INote>) {
  await db.connect();
  const note = new Note(data);
  const result = await db.insertOne<INote>(COLLECTION, note);
  return new Note({ ...note, _id: result._id });
}

export async function updateNote(id: string, data: Partial<INote>) {
  await db.connect();
  const note = await getNote(id);
  if (!note) return null;

  const updatedData = {
    ...data,
    updatedAt: new Date(),
  };

  const success = await db.updateOne<INote>(
    COLLECTION,
    { _id: new ObjectId(id) },
    updatedData
  );

  if (success) {
    return await getNote(id);
  }
  return null;
}

export async function deleteNote(id: string) {
  await db.connect();
  return await db.deleteOne<INote>(COLLECTION, { _id: new ObjectId(id) });
}
