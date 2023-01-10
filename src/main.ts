import { Plugin } from "obsidian";
import { DEFAULT_SETTINGS, RedSettings } from "./settings/red-settings";

import { AddBookModal } from "./view/add-book-modal";
import { RedSettingsTab } from "./view/settings";

export default class Red extends Plugin {
  settings: RedSettings;

  async onload() {
    await this.loadSettings();

    // This adds a simple command that can be triggered anywhere
    this.addCommand({
      id: "red-add-book",
      name: "Add Book",
      callback: () => {
        new AddBookModal(this.app).open();
      },
    });

    // TODO: toggle reading status?
    // This adds an editor command that can perform some operation on the current editor instance
    // this.addCommand({
    //   id: "sample-editor-command",
    //   name: "Sample editor command",
    //   editorCallback: (editor: Editor, view: MarkdownView) => {
    //     console.log(editor.getSelection());
    //     editor.replaceSelection("Sample Editor Command");
    //   },
    // });

    // // This adds a complex command that can check whether the current state of the app allows execution of the command
    // this.addCommand({
    //   id: "open-sample-modal-complex",
    //   name: "Open sample modal (complex)",
    //   checkCallback: (checking: boolean) => {
    //     // Conditions to check
    //     const markdownView =
    //       this.app.workspace.getActiveViewOfType(MarkdownView);
    //     if (markdownView) {
    //       // If checking is true, we're simply "checking" if the command can be run.
    //       // If checking is false, then we want to actually perform the operation.
    //       if (!checking) {
    //         new SampleModal(this.app).open();
    //       }

    //       // This command will only show up in Command Palette when the check function returns true
    //       return true;
    //     }
    //   },
    // });

    // This adds a settings tab so the user can configure various aspects of the plugin
    this.addSettingTab(new RedSettingsTab(this.app, this));
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
