export interface RedSettings {
  libraryFolder: string;
  template: string | null;
}

export const DEFAULT_SETTINGS: RedSettings = {
  libraryFolder: "books",
  template: null,
};
