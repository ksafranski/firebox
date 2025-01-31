import { ObjectId } from "mongodb";

export interface IBook {
  _id?: ObjectId | (ObjectId & string);
  // Basic Information
  isbn13: string;
  isbn10?: string;
  title: string;
  subtitle?: string;
  authors: string[];
  edition?: string;
  language: string;
  pageCount: number;
  format: string;
  genre: string[];
  description: string;
  coverImage?: string;

  // Publishing Details
  publisher: string;
  imprint?: string;
  publishDate: Date;
  publicationCity?: string;
  publicationCountry?: string;
  printRun?: number;
  status: string; // e.g., "Announced", "Forthcoming", "Active", "Out of Print"
  rights?: string[];
  copyrightYear?: number;
  copyrightHolder?: string;

  // Physical Details
  dimensions?: {
    height: number;
    width: number;
    depth: number;
    unit: string; // mm, cm, in
  };
  weight?: {
    value: number;
    unit: string; // g, kg, oz, lb
  };
  paperStock?: string;
  bindingMethod?: string;
  printType?: string; // e.g., "Offset", "Digital", "Print on Demand"
  color?: boolean;

  // Marketing & Sales
  audience?: string[];
  ageRange?: {
    min?: number;
    max?: number;
  };
  readingLevel?: string;
  bisacCodes?: string[];
  keywords?: string[];
  marketingText?: string;
  reviewQuotes?: Array<{
    quote: string;
    author: string;
    source?: string;
    date?: Date;
  }>;
  awards?: Array<{
    name: string;
    year: number;
    category?: string;
  }>;

  // Commercial Details
  price?: {
    value: number;
    currency: string;
  };
  discountCode?: string;
  returnable?: boolean;
  distributors?: Array<{
    name: string;
    territory: string;
    exclusive: boolean;
  }>;

  // Digital Details
  digitalRights?: {
    drm: boolean;
    territories: string[];
    restrictions?: string[];
  };
  fileSize?: number; // in KB
  wordCount?: number;

  // System Fields
  createdAt: Date;
  updatedAt: Date;
}

export interface IBookJSON
  extends Omit<
    IBook,
    "publishDate" | "createdAt" | "updatedAt" | "_id" | "reviewQuotes"
  > {
  _id?: string;
  publishDate: string;
  createdAt: string;
  updatedAt: string;
  reviewQuotes?: Array<{
    quote: string;
    author: string;
    source?: string;
    date?: string;
  }>;
}

export class Book implements IBook {
  _id?: ObjectId | (ObjectId & string);
  isbn13: string;
  isbn10?: string;
  title: string;
  subtitle?: string;
  authors: string[];
  edition?: string;
  language: string;
  pageCount: number;
  format: string;
  genre: string[];
  description: string;
  coverImage?: string;
  publisher: string;
  imprint?: string;
  publishDate: Date;
  publicationCity?: string;
  publicationCountry?: string;
  printRun?: number;
  status: string;
  rights?: string[];
  copyrightYear?: number;
  copyrightHolder?: string;
  dimensions?: {
    height: number;
    width: number;
    depth: number;
    unit: string;
  };
  weight?: {
    value: number;
    unit: string;
  };
  paperStock?: string;
  bindingMethod?: string;
  printType?: string;
  color?: boolean;
  audience?: string[];
  ageRange?: {
    min?: number;
    max?: number;
  };
  readingLevel?: string;
  bisacCodes?: string[];
  keywords?: string[];
  marketingText?: string;
  reviewQuotes?: Array<{
    quote: string;
    author: string;
    source?: string;
    date?: Date;
  }>;
  awards?: Array<{
    name: string;
    year: number;
    category?: string;
  }>;
  price?: {
    value: number;
    currency: string;
  };
  discountCode?: string;
  returnable?: boolean;
  distributors?: Array<{
    name: string;
    territory: string;
    exclusive: boolean;
  }>;
  digitalRights?: {
    drm: boolean;
    territories: string[];
    restrictions?: string[];
  };
  fileSize?: number;
  wordCount?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<IBook & { _id?: string | ObjectId }>) {
    this._id = !data._id
      ? undefined
      : typeof data._id === "string"
      ? new ObjectId(data._id)
      : data._id;
    this.isbn13 = data.isbn13 || "";
    this.isbn10 = data.isbn10;
    this.title = data.title || "";
    this.subtitle = data.subtitle;
    this.authors = data.authors || [];
    this.edition = data.edition;
    this.language = data.language || "en";
    this.pageCount = data.pageCount || 0;
    this.format = data.format || "Paperback";
    this.genre = data.genre || [];
    this.description = data.description || "";
    this.coverImage = data.coverImage;
    this.publisher = data.publisher || "";
    this.imprint = data.imprint;
    this.publishDate = data.publishDate
      ? new Date(data.publishDate)
      : new Date();
    this.publicationCity = data.publicationCity;
    this.publicationCountry = data.publicationCountry;
    this.printRun = data.printRun;
    this.status = data.status || "Active";
    this.rights = data.rights;
    this.copyrightYear = data.copyrightYear;
    this.copyrightHolder = data.copyrightHolder;
    this.dimensions = data.dimensions;
    this.weight = data.weight;
    this.paperStock = data.paperStock;
    this.bindingMethod = data.bindingMethod;
    this.printType = data.printType;
    this.color = data.color;
    this.audience = data.audience;
    this.ageRange = data.ageRange;
    this.readingLevel = data.readingLevel;
    this.bisacCodes = data.bisacCodes;
    this.keywords = data.keywords;
    this.marketingText = data.marketingText;
    this.reviewQuotes = data.reviewQuotes;
    this.awards = data.awards;
    this.price = data.price;
    this.discountCode = data.discountCode;
    this.returnable = data.returnable;
    this.distributors = data.distributors;
    this.digitalRights = data.digitalRights;
    this.fileSize = data.fileSize;
    this.wordCount = data.wordCount;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  static fromJSON(json: IBookJSON): Book {
    return new Book({
      // @ts-expect-error: stupid typescript
      _id: json._id ? (new ObjectId(json._id) as ObjectId) : new ObjectId(),
      ...json,
      publishDate: new Date(json.publishDate),
      reviewQuotes: json.reviewQuotes?.map((quote) => ({
        ...quote,
        date: quote.date ? new Date(quote.date) : undefined,
      })),
      createdAt: new Date(json.createdAt),
      updatedAt: new Date(json.updatedAt),
    });
  }

  toJSON(): IBookJSON {
    const json: Omit<IBookJSON, "_id"> = {
      isbn13: this.isbn13,
      isbn10: this.isbn10,
      title: this.title,
      subtitle: this.subtitle,
      authors: this.authors,
      edition: this.edition,
      language: this.language,
      pageCount: this.pageCount,
      format: this.format,
      genre: this.genre,
      description: this.description,
      coverImage: this.coverImage,
      publisher: this.publisher,
      imprint: this.imprint,
      publishDate:
        this.publishDate instanceof Date
          ? this.publishDate.toISOString()
          : new Date(this.publishDate).toISOString(),
      publicationCity: this.publicationCity,
      publicationCountry: this.publicationCountry,
      printRun: this.printRun,
      status: this.status,
      rights: this.rights,
      copyrightYear: this.copyrightYear,
      copyrightHolder: this.copyrightHolder,
      dimensions: this.dimensions,
      weight: this.weight,
      paperStock: this.paperStock,
      bindingMethod: this.bindingMethod,
      printType: this.printType,
      color: this.color,
      audience: this.audience,
      ageRange: this.ageRange,
      readingLevel: this.readingLevel,
      bisacCodes: this.bisacCodes,
      keywords: this.keywords,
      marketingText: this.marketingText,
      reviewQuotes: this.reviewQuotes?.map((quote) => ({
        ...quote,
        date: quote.date?.toISOString(),
      })),
      awards: this.awards,
      price: this.price,
      discountCode: this.discountCode,
      returnable: this.returnable,
      distributors: this.distributors,
      digitalRights: this.digitalRights,
      fileSize: this.fileSize,
      wordCount: this.wordCount,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };

    // Remove undefined properties
    Object.keys(json).forEach(
      (key) =>
        json[key as keyof typeof json] === undefined &&
        delete json[key as keyof typeof json]
    );

    return {
      ...json,
      _id: this._id?.toString(),
    };
  }
}
