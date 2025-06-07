/**
 * Retrieves the extension for a given file.
 *
 * @param filename name of file provided
 *
 * @returns file extension (lower case)
 */
const getFileExtension = (filename: string) => {
  return filename
    .slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2)
    .toLowerCase();
};

export { getFileExtension };
