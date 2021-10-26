/* eslint class-methods-use-this: ["error", {
  "exceptMethods": [
    "download"
  ]
}] */
import browser from 'webextension-polyfill';

export default class Downloads {
  constructor(name) {
    this.name = name;
  }

  async download({ url, name, meta }) {
    const filename = `${name ?? Date.now()}`;
    const downloadId = await browser.downloads.download({ url, filename });
    if (downloadId) {
      const storageName = `downloads.${name}`;
      const { [storageName]: downloads = {} } = await browser.storage.local.get(storageName);
      downloads[downloadId] = meta;
      await browser.storage.local.set({ [storageName]: downloads });
    }
    return downloadId;
  }
}
