import { NextResponse } from "next/server";
import { getContacts, createContact } from "../../blox/contacts/api";

export async function GET() {
  try {
    const contacts = await getContacts();
    return NextResponse.json(contacts.map((contact) => contact.toJSON()));
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const contact = await createContact(data);
    return NextResponse.json(contact.toJSON());
  } catch (error) {
    console.error("Error creating contact:", error);
    return NextResponse.json(
      { error: "Failed to create contact" },
      { status: 500 }
    );
  }
}
