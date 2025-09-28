import { getFileExtension } from '../../../src/api/utils/fileUtils';

describe('getFileExtension', () => {
  it('returns the lower-cased extension for filenames with a single dot', () => {
    expect(getFileExtension('image.PNG')).toBe('png');
  });

  it('returns the extension after the last dot for filenames with multiple dots', () => {
    expect(getFileExtension('archive.tar.gz')).toBe('gz');
  });

  it('returns an empty string when there is no extension', () => {
    expect(getFileExtension('README')).toBe('');
  });
});