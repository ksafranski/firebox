import { IBookJSON } from "../models/Book";

export function generateOnix(book: IBookJSON): string {
  const now = new Date().toISOString().split("T")[0];

  // Map language codes to ONIX language codes
  const languageMap: { [key: string]: string } = {
    en: "eng",
    es: "spa",
    fr: "fre",
    de: "ger",
    it: "ita",
    pt: "por",
    ru: "rus",
    zh: "chi",
    ja: "jpn",
  };

  // Map format to ONIX ProductForm codes
  const formatMap: { [key: string]: string } = {
    Hardcover: "BB",
    Paperback: "BC",
    eBook: "EB",
    Audiobook: "AJ",
  };

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<ONIXMessage release="3.0" xmlns="http://ns.editeur.org/onix/3.0/reference">
  <Header>
    <Sender>
      <SenderName>Fireblox</SenderName>
    </Sender>
    <SentDateTime>${now}T00:00:00Z</SentDateTime>
    <MessageNote>ONIX 3.0 output from Fireblox</MessageNote>
  </Header>
  <Product>
    <RecordReference>${book.isbn13}</RecordReference>
    <NotificationType>03</NotificationType>
    <ProductIdentifier>
      <ProductIDType>15</ProductIDType>
      <IDValue>${book.isbn13}</IDValue>
    </ProductIdentifier>
    <DescriptiveDetail>
      <ProductComposition>00</ProductComposition>
      <ProductForm>${formatMap[book.format] || "BB"}</ProductForm>
      <TitleDetail>
        <TitleType>01</TitleType>
        <TitleElement>
          <TitleElementLevel>01</TitleElementLevel>
          <TitleText>${book.title}</TitleText>
          ${book.subtitle ? `<Subtitle>${book.subtitle}</Subtitle>` : ""}
        </TitleElement>
      </TitleDetail>
      <Language>
        <LanguageRole>01</LanguageRole>
        <LanguageCode>${languageMap[book.language] || "eng"}</LanguageCode>
      </Language>
      ${book.authors
        .map(
          (author) => `
      <Contributor>
        <SequenceNumber>1</SequenceNumber>
        <ContributorRole>A01</ContributorRole>
        <PersonName>${author}</PersonName>
      </Contributor>`
        )
        .join("")}
      <Extent>
        <ExtentType>00</ExtentType>
        <ExtentValue>${book.pageCount}</ExtentValue>
        <ExtentUnit>03</ExtentUnit>
      </Extent>
      ${book.genre
        .map(
          (subject) => `
      <Subject>
        <MainSubject/>
        <SubjectSchemeIdentifier>20</SubjectSchemeIdentifier>
        <SubjectHeadingText>${subject}</SubjectHeadingText>
      </Subject>`
        )
        .join("")}
    </DescriptiveDetail>
    <CollateralDetail>
      <TextContent>
        <TextType>03</TextType>
        <ContentAudience>00</ContentAudience>
        <Text>${book.description}</Text>
      </TextContent>
      ${
        book.coverImage
          ? `
      <SupportingResource>
        <ResourceContentType>01</ResourceContentType>
        <ContentAudience>00</ContentAudience>
        <ResourceMode>03</ResourceMode>
        <ResourceVersion>
          <ResourceForm>02</ResourceForm>
          <ResourceLink>${book.coverImage}</ResourceLink>
        </ResourceVersion>
      </SupportingResource>`
          : ""
      }
    </CollateralDetail>
    <PublishingDetail>
      <Publisher>
        <PublishingRole>01</PublishingRole>
        <PublisherName>${book.publisher}</PublisherName>
      </Publisher>
      <PublishingDate>
        <PublishingDateRole>01</PublishingDateRole>
        <Date>${new Date(book.publishDate).toISOString().split("T")[0]}</Date>
      </PublishingDate>
    </PublishingDetail>
  </Product>
</ONIXMessage>`;

  return xml;
}
