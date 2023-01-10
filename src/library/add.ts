import { App, normalizePath, TFile, moment } from "obsidian";

import type { RedSettings } from "src/settings/red-settings";

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

  const createdNote = await app.vault.create(path, "");
  let contents = "";
  if (isTemplaterEnabled(app)) {
    contents = await createWithTemplater(app, createdNote, settings.template);
  } else if (isTemplatesEnabled(app)) {
    contents = await createWithTemplates(app, settings.template);
  }

  await app.vault.adapter.write(path, contents);

  await app.fileManager.processFrontMatter(createdNote, (fm) => {
    // title
    fm["title"] = book.title;

    // subtitle
    if (book.subtitle && book.subtitle.length > 0) {
      fm["subtitle"] = book.subtitle;
    }

    // authors/author
    if (book.authors.length > 1) {
      fm["authors"] = book.authors;
    } else if (book.authors.length === 1) {
      fm["author"] = book.authors[0];
    }

    // status
    fm["status"] = book.status;

    // readthroughs
    if (book.readthroughs.length > 1) {
      const rts = [];
      for (const readthrough of book.readthroughs) {
        const rt: Record<string, string> = {};
        if (readthrough.start) {
          rt["start"] = readthrough.start;
        }
        if (readthrough.end) {
          rt["end"] = readthrough.end;
        }
        rts.push(rt);
      }
      fm["readthroughs"] = rts;
    } else if (book.readthroughs.length === 1) {
      const rt = book.readthroughs[0];
      if (rt.start) {
        fm["start"] = rt.start;
      }
      if (rt.end) {
        fm["end"] = rt.end;
      }
    }

    // isbn
    if (book.isbn) {
      fm["isbn"] = book.isbn;
    }

    // cover
    if (book.cover) {
      fm["cover"] = book.cover;
    }
  });

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
  file: TFile,
  templatePath: string
): Promise<string> {
  const templaterPlugin = (app as any).plugins.getPlugin("templater-obsidian");
  if (!templaterPlugin) {
    console.error("[Red] Attempted to use Templater plugin while disabled.");
    return;
  }
  const template = app.vault.getAbstractFileByPath(templatePath);

  const runningConfig = templaterPlugin.templater.create_running_config(
    template,
    file,
    0
  );
  return await templaterPlugin.templater.read_and_parse_template(runningConfig);
}

async function createWithTemplates(
  app: App,
  templatePath: string
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
  let contents = await app.vault.adapter.read(templatePath);

  // Replace {{date}} and {{time}}
  const dateFormat = corePlugin.options["dateFormat"] || "YYYY-MM-DD";
  const timeFormat = corePlugin.options["timeFormat"] || "HH:mm";

  contents = contents.replace("{{date}}", moment().format(dateFormat));
  contents = contents.replace("{{time}}", moment().format(timeFormat));

  return contents;
}
