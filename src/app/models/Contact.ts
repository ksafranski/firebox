import { ObjectId } from "mongodb";

export interface IContact {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactJSON {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export class Contact implements IContact {
  _id?: ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IContact>) {
    this._id = data._id;
    this.firstName = data.firstName || "";
    this.lastName = data.lastName || "";
    this.email = data.email || "";
    this.phoneNumber = data.phoneNumber || "";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromJSON(json: IContactJSON): Contact {
    return new Contact({
      _id: json._id ? new ObjectId(json._id) : undefined,
      firstName: json.firstName,
      lastName: json.lastName,
      email: json.email,
      phoneNumber: json.phoneNumber,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }

  toJSON(): IContactJSON {
    return {
      _id: this._id?.toString(),
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phoneNumber: this.phoneNumber,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
