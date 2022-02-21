import { App, normalizePath } from "obsidian";

// these will be preferences
const BOOKS_FOLDER = "books/";
const BOOK_CORE_TEMPLATE = "core-templates/Core Template Book.md";
const BOOK_TEMPLATER_TEMPLATE = "TODO";

export type BookToAdd = {
  title: string;
  subtitle: string | null;
  authors: string[];
  isbn: string | null;
  cover: string | null;
  readthroughs: {
    start: string | null;
    end: string | null;
  }[];
};

export async function addBook(app: App, book: BookToAdd) {
  // Create the note
  const normalizedName = book.title.replace(/[\/\\:]/g, "-");

  console.log(normalizedName);

  const path = normalizePath(`${BOOKS_FOLDER}/${normalizedName}.md`);
  await app.vault.create(path, "");
  await app.workspace.openLinkText(path, "/", false);

  // TODO: check for templater first

  // Insert the template
  const corePlugin = (app as any).internalPlugins.getPluginById("templates");
  if (corePlugin && corePlugin.enabled) {
    // Get template body
    const contents = await app.vault.adapter.read(BOOK_CORE_TEMPLATE);

    // Replace {{date}} and {{time}}
    const dateFormat =
      corePlugin.instance.options["dateFormat"] || "YYYY-MM-DD";
    const timeFormat = corePlugin.instance.options["timeFormat"] || "HH:mm";

    const dateString = window.moment().format(dateFormat);
    const timeString = window.moment().format(timeFormat);

    // Replace book data
    const newContents = replace(contents, [
      ["date", dateString],
      ["time", timeString],
      ["title", book.title],
      ["subtitle", book.subtitle],
      ["author", book.authors.join(", ")],
      ["isbn", book.isbn],
      ["cover", book.cover],
    ]);

    // Create note
    await app.vault.adapter.write(path, newContents);
  }
}

function replace(contents: string, tokens: [string, string][]) {
  let newContents = contents;
  for (const [token, value] of tokens) {
    if (value) {
      newContents = newContents.replace(`{{${token}}}`, value);
    }
  }
  return newContents;
}
