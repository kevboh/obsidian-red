import { App, PluginSettingTab, Setting } from "obsidian";

import type { default as Red } from "../../main";
import { FileSuggest, FolderSuggest } from "./folder-suggest";

export class RedSettingsTab extends PluginSettingTab {
  plugin: Red;

  constructor(app: App, plugin: Red) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Red Settings" });

    new Setting(containerEl)
      .setName("Library folder")
      .setDesc("Vault folder where your book notes live.")
      .addSearch((cb) => {
        new FolderSuggest(this.app, cb.inputEl);
        cb.setPlaceholder("books")
          .setValue(this.plugin.settings.libraryFolder)
          .onChange(async (v) => {
            this.plugin.settings.libraryFolder = v;
            await this.plugin.saveSettings();
          });
      });

    new Setting(containerEl)
      .setName("Book template")
      .setDesc("Template for new books.")
      .addSearch((cb) => {
        new FileSuggest(this.app, cb.inputEl);
        cb.setPlaceholder("templates/Book.md")
          .setValue(this.plugin.settings.template)
          .onChange(async (v) => {
            this.plugin.settings.template = v;
            await this.plugin.saveSettings();
          });
      });

    containerEl.createEl("p", {}, (el) => {
      el.innerHTML =
        "You can use either the core template or Templater plugin for this template. If both plugins are enabled, Templater is preferred. If no template is specified or no plugins are enabled an empty note is created.";
    });
  }
}
