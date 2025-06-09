interface PluginNpmSearchResult {
  objects: {
    package: {
      name: string;
      description?: string;
      links: {
        npm: string;
      };
      version: string;
    };
  }[];
}

export { PluginNpmSearchResult };
