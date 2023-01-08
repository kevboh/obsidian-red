import { App, normalizePath, stringifyYaml } from "obsidian";
import { pickBy } from "lodash";

import type { RedSettings } from "src/main";

export type Readthrough = {
  start: string | null;
  end: string | null;
};

export type BookToAdd = {
  title: string;
  subtitle: string | null;
  authors: string[];
  isbn: string | null;
  cover: string | null;
  readthroughs: Readthrough[];
  status: "reading" | "to read" | "read";
};

export async function addBook(app: App, book: BookToAdd) {
  // Get preferences
  const settings: RedSettings = (app as any).plugins.getPlugin("red").settings;

  // Create the note
  const normalizedName = book.title.replace(/[\/\\:]/g, "-");
  const path = normalizePath(`${settings.libraryFolder}/${normalizedName}.md`);

  const tokens: [string, string][] = [
    ["title", book.title],
    ["subtitle", book.subtitle],
    ["authors", generateAuthorYAML(book.authors)],
    ["isbn", book.isbn],
    ["cover", book.cover],
    ["readthroughs", generateReadthroughYAML(book.readthroughs)],
    ["status", book.status],
  ];

  let contents = "";
  if (isTemplaterEnabled(app)) {
    contents = await createWithTemplater(app, path, settings.template, tokens);
  } else if (isTemplatesEnabled(app)) {
    contents = await createWithTemplates(app, settings.template, tokens);
  }

  await app.vault.adapter.write(path, contents);
  await app.workspace.openLinkText(path, "/", false);
}

function isTemplaterEnabled(app: App): boolean {
  return !!(app as any).plugins.getPlugin("templater-obsidian");
}

function isTemplatesEnabled(app: App): boolean {
  return !!(app as any).internalPlugins.getEnabledPluginById("templates");
}

async function createWithTemplater(
  app: App,
  path: string,
  templatePath: string,
  tokens: [string, string][]
): Promise<string> {
  const templaterPlugin = (app as any).plugins.getPlugin("templater-obsidian");
  if (!templaterPlugin) {
    console.error("[Red] Attempted to use Templater plugin while disabled.");
    return;
  }
  const template = app.vault.getAbstractFileByPath(templatePath);

  const createdNote = await app.vault.create(path, "");
  const runningConfig = templaterPlugin.templater.create_running_config(
    template,
    createdNote,
    0
  );
  const contents = await templaterPlugin.templater.read_and_parse_template(
    runningConfig
  );
  const newContents = replace(contents, tokens);

  return newContents;
}

async function createWithTemplates(
  app: App,
  templatePath: string,
  tokens: [string, string][]
): Promise<string> {
  const corePlugin = (app as any).internalPlugins.getEnabledPluginById(
    "templates"
  );
  if (!corePlugin) {
    console.error(
      "[Red] Attempted to use core template plugin while disabled."
    );
    return;
  }
  // Get template body
  const contents = await app.vault.adapter.read(templatePath);

  // Replace {{date}} and {{time}}
  const dateFormat = corePlugin.options["dateFormat"] || "YYYY-MM-DD";
  const timeFormat = corePlugin.options["timeFormat"] || "HH:mm";

  const dateString = window.moment().format(dateFormat);
  const timeString = window.moment().format(timeFormat);

  // Replace book data
  const newContents = replace(contents, [
    ["date", dateString],
    ["time", timeString],
    ...tokens,
  ]);

  return newContents;
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

function generateAuthorYAML(authors: string[]): string {
  if (authors.length === 0) {
    return "";
  } else if (authors.length === 1) {
    return `author: ${authors.first()}`;
  } else {
    return stringifyYaml({
      authors: authors,
    }).trim();
  }
}

function generateReadthroughYAML(readthroughs: Readthrough[]): string {
  if (readthroughs.length === 0) {
    return "";
  } else if (readthroughs.length === 1) {
    return stringifyYaml(cleanYAML(readthroughs.first())).trim();
  } else {
    return stringifyYaml({
      readthroughs: readthroughs.map((r) => cleanYAML(r)),
    }).trim();
  }
}

function cleanYAML(obj: any): any {
  return pickBy(obj, (value, key) => !!value);
}
