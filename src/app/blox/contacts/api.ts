import { MongoDBAdapter } from "../mongodb/adapter";
import { Contact, IContact } from "../../models/Contact";
import { ObjectId } from "mongodb";

const db = new MongoDBAdapter();
const COLLECTION = "contacts";

export async function getContacts() {
  await db.connect();
  const contacts = await db.find<IContact>(COLLECTION, {});
  return contacts.map((contact) => new Contact(contact));
}

export async function getContact(id: string) {
  await db.connect();
  const contact = await db.findOne<IContact>(COLLECTION, {
    _id: new ObjectId(id),
  });
  return contact ? new Contact(contact) : null;
}

export async function createContact(data: Partial<IContact>) {
  await db.connect();
  const contact = new Contact(data);
  const result = await db.insertOne<IContact>(COLLECTION, contact);
  return new Contact({ ...contact, _id: result._id });
}

export async function updateContact(id: string, data: Partial<IContact>) {
  await db.connect();
  const contact = await getContact(id);
  if (!contact) return null;

  const updatedData = {
    ...data,
    updatedAt: new Date(),
  };

  const success = await db.updateOne<IContact>(
    COLLECTION,
    { _id: new ObjectId(id) },
    updatedData
  );

  if (success) {
    return await getContact(id);
  }
  return null;
}

export async function deleteContact(id: string) {
  await db.connect();
  return await db.deleteOne<IContact>(COLLECTION, { _id: new ObjectId(id) });
}
