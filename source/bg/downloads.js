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

  async download({ url, name, meta }, save = false) {
    const filename = `${name ?? Date.now()}`;
    const downloadId = await browser.downloads.download({ url, filename });
    if (downloadId && save) {
      await this.save({ downloadId, meta });
    }
    return downloadId;
  }

  async save({ downloadId, meta }) {
    const storageName = `downloads.${this.name}`;
    const { [storageName]: downloads = {} } = await browser.storage.local.get(storageName);
    downloads[downloadId] = meta;
    await browser.storage.local.set({ [storageName]: downloads });
  }
}
