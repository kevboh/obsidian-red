import { App, Modal } from "obsidian";
import { addBook } from "src/library/add";

import AddBook from "./AddBook.svelte";

export class AddBookModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const context = new Map();

    context.set("addBook", (title: string) => {
      addBook(this.app, title);
      this.close();
    });

    new AddBook({
      target: this.contentEl,
      context,
    });
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
