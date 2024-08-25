/**
 * Runs the job for processing theme queue.
 */
const runProcessThemeQueue = async () => {
  // todo: grab all themes from ThemeJob table
  //const themeJobs = [];

  // todo: de-dupe (i.e. if the same theme is both created and deleted, keep the latest one by timestamp)

  // todo: filter for themes to create
  const themesToCreate: string[] = [];
  // todo: filter for themes to delete
  const themesToDelete: string[] = [];

  const toAdd = await fetchFilesToAdd(themesToCreate);
  const toRemove = await fetchFilesToDelete(themesToDelete);

  // todo: use a github application to create pull requests to the themes repository to add/remove files
  console.info(toAdd);
  console.info(toRemove);

  // todo: upon successful update of thenes, update their updated_at field within the theme table
};

/**
 * Fetches the files to add.
 *
 * @param themes themes to determine files to add
 */
const fetchFilesToAdd = async (themes: string[]) => {
  console.log(themes)
  // todo: grab all entries from ThemeJob table
  // todo: fetch files from minio for each theme in the table
  // todo: generate meta.json from name, description etc
  // todo: return a list of folders/files to add to the github themes repository (including generated meta.json)
};

/**
 * Fetches the files to delete.
 *
 * @param themes themes to determine files to delete
 */
const fetchFilesToDelete = async (themes: string[]) => {
  console.log(themes)
  // todo: grab all entries from ThemeJob table
  // todo: fetch files from minio for each theme in the table
  // todo: return a list of folders/files to delete in the github themes repository
};

export { runProcessThemeQueue };
