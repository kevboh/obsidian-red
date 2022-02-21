// import { } from "obsidian"

export type SearchResult = {
  title: string;
  subtitle: string | null;
  authors: string[];
  description: string | null;
  industryIdentifiers: {
    type: "ISBN_10" | "ISBN_13" | "ISSN" | "OTHER";
    identifier: string;
  }[];
  imageLinks: {
    smallThumbnail: string | null;
    thumbnail: string | null;
  } | null;
};

export type WrappedResults = {
  id: string;
  volumeInfo: SearchResult;
};

const LIMITED_FIELDS =
  "items(id,volumeInfo(title,subtitle,authors,description,industryIdentifiers,imageLinks))";

export async function search(term: string): Promise<WrappedResults[]> {
  console.log(`Searching ${term}`);
  const url = `https://www.googleapis.com/books/v1/volumes?q=${term}&fields=${LIMITED_FIELDS}`;

  const res = await fetch(url);
  const json: { items: WrappedResults[] } = await res.json();
  console.log(json);
  return json.items;
}

export function getISBN(result: SearchResult): string | null {
  return (
    result.industryIdentifiers.find((i) => i.type === "ISBN_13")?.identifier ||
    result.industryIdentifiers.find((i) => i.type === "ISBN_10")?.identifier ||
    null
  );
}
