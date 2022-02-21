import { App, Modal } from "obsidian";
import { addBook, BookToAdd } from "src/library/add";

import AddBook from "./AddBook.svelte";

export class AddBookModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    const context = new Map();

    context.set("addBook", (book: BookToAdd) => {
      addBook(this.app, book);
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
