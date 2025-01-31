import { ObjectId } from "mongodb";

export interface INote {
  _id?: ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoteJSON {
  _id?: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export class Note implements INote {
  _id?: ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<INote>) {
    this._id = data._id;
    this.title = data.title || "";
    this.content = data.content || "";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromJSON(json: INoteJSON): Note {
    return new Note({
      _id: json._id ? new ObjectId(json._id) : undefined,
      title: json.title,
      content: json.content,
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }

  toJSON(): INoteJSON {
    return {
      _id: this._id?.toString(),
      title: this.title,
      content: this.content,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
