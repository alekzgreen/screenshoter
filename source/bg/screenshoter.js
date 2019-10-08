import {
  // createTab,
  uuidv4,
  sendCommand,
  executeScripts,
  asyncTimeout,
  attachDebugger,
  detachDebugger,
  setStorageData,
  getStorageData,
  captureVisibleTab,
  sendBackgroundMessage,
} from '../utils';
import FireSaver from './fireSaver';

/* eslint class-methods-use-this: ["error", {
  "exceptMethods": [
    "init",
    "setEvents",
    "executeScripts",
    "sendCommand",
    "makeVisibleTabScreenshot",
    "printToPDF",
    "saveImage",
    "deleteImage"
  ]
}] */

const fireSaver = new FireSaver({
  apiKey: 'AIzaSyB7IG2gAqcU5XTepnCHYaQk5bhX_Mqo34Y',
  authDomain: 't1nylink.firebaseapp.com',
  databaseURL: 'https://t1nylink.firebaseio.com',
  projectId: 't1nylink',
  storageBucket: 't1nylink.appspot.com',
  messagingSenderId: '308873833962',
  appId: '1:308873833962:web:c5869b0575dc9455b15693',
});

export default class Screenshoter {
  constructor() {
    this.saving = false;
    this.setEvents();
  }

  async executeScripts(tabId) {
    try {
      await sendBackgroundMessage(tabId, { module: 'content', action: 'ping' });
    } catch (e) {
      await executeScripts(tabId, ['vendors/bundle.js', 'content/bundle.js']);
    }
  }

  async makeFullSizeScreenshot({ id: tabId, width: tabWidth }) {
    await attachDebugger({ tabId }, '1.2');
    await this.executeScripts(tabId);
    const viewport = { x: 0, y: 0, scale: 1 };
    const sizes = await sendBackgroundMessage(tabId, {
      module: 'content',
      action: 'getPageSizes',
    });
    Object.assign(viewport, {
      width: tabWidth,
      height: Math.min(sizes.scrollHeight - sizes.clientHeight, 15000 / sizes.ratio),
    });
    await sendBackgroundMessage(tabId, { module: 'content', action: 'scrollStart' });
    await sendCommand({ tabId }, 'Emulation.setDeviceMetricsOverride', {
      mobile: false,
      width: tabWidth,
      height: Math.min(sizes.scrollHeight, 15000 / sizes.ratio),
      deviceScaleFactor: sizes.ratio,
      viewport,
    });
    await asyncTimeout(1000);
    const result = await sendCommand({ tabId }, 'Page.captureScreenshot', {
      format: 'png', clip: viewport,
    });
    await detachDebugger({ tabId });
    return `data:image/png;base64,${result.data}`;
  }

  async makeVisibleTabScreenshot({ windowId }) {
    return captureVisibleTab(windowId);
  }

  async printToPDF({ id: tabId }) {
    await attachDebugger({ tabId }, '1.2');
    const result = await sendCommand({ tabId }, 'Page.printToPDF', {});
    return `data:application/pdf;base64,${result.data}`;
  }

  async saveImage({ url, title }, imageUrl, type) {
    if (this.saving) {
      return false;
    }
    const { images = {} } = await getStorageData('images');
    const id = this.generateUniqueId(Object.keys(images));
    const fullLink = await fireSaver.upload(imageUrl, `public/images/${id}`);
    const shortLinkData = fullLink ? await fireSaver.createShortLink(fullLink) : null;
    images[id] = Object.assign({
      url,
      title,
      imageUrl,
      fullLink,
      type,
      created: Date.now(),
    }, shortLinkData);
    return setStorageData({ images });
  }

  async deleteImage(id) {
    const { images } = await getStorageData('images');
    delete images[id];
    await setStorageData({ images });
    const fileRef = fireSaver.getFileRef(`public/images/${id}`);
    fileRef.delete();
  }

  generateUniqueId(ids) {
    const id = uuidv4();
    if (ids.includes(id)) {
      return this.generateUniqueId(ids);
    }
    return id;
  }

  setEvents() {
    chrome.browserAction.onClicked.addListener(async (tab) => {
      const imageUrl = await this.makeVisibleTabScreenshot(tab);
      await this.saveImage(tab, imageUrl, 'visibleTab');
      // chrome.downloads.download({ url });
    });
    /* chrome.runtime.onMessage.addListener(({ action, module, data }, sender, sendResponse) => {
      if (module !== 'screenshoter' || typeof this[action] !== 'function') {
        return false;
      }
      this[action]({ data, sender, sendResponse });
      return true;
    }); */
  }
}
