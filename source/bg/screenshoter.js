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
  downloadFile,
  captureVisibleTab,
  sendBackgroundMessage,
  removeAllContextMenus,
  createContextMenu,
  makeThumbnail,
  getTab,
} from '../utils';
import { disabledUrls } from '../constants';
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
    "deleteImage",
    "createContextMenu",
    "isDisabledUrl",
    "saveChunks",
    "loadImages"
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
    this.chunks = [];
    this.setEvents();
  }

  async executeScripts(tabId) {
    try {
      await sendBackgroundMessage(tabId, { module: 'content', action: 'ping' });
    } catch (e) {
      await executeScripts(tabId, ['vendors/bundle.js', 'content/bundle.js']);
    }
  }

  async saveChunk({ sender, sendResponse }) {
    const imageUrl = await this.makeVisibleTabScreenshot(sender.tab);
    this.chunks.push(imageUrl);
    sendResponse(true);
  }

  async saveChunks() {
    const canvas = document.createElement('canvas');
    document.body.append(canvas);
    const ctx = canvas.getContext('2d');
    const images = await this.loadImages(this.chunks);
    canvas.width = images[1].width;
    canvas.height = images[1].height * images.length;
    images.reverse();
    images.forEach((image, index) => ctx.drawImage(image, 0, index * image.height));
    const dataUrl = canvas.toDataURL();
    this.chunks = [];
    // console.log(dataUrl);
    downloadFile({ url: dataUrl });
  }

  async loadImages(dataUrls) {
    return Promise.all(dataUrls.map((dataUrl) => {
      const promise = new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = dataUrl;
      });
      return promise;
    }));
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
    const thumbnail = await makeThumbnail(imageUrl, 0.5);
    images[id] = Object.assign({
      url,
      title,
      imageUrl,
      thumbnail,
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

  async createContextMenu(onlyVisible) {
    await removeAllContextMenus();
    await createContextMenu({
      id: 'mainContext',
      title: 'Frame',
    });
    await createContextMenu({
      id: 'makeVisibleTabScreenshotMenu',
      parentId: 'mainContext',
      title: 'Capture visible zone',
      onclick: async (info, tab) => {
        const imageUrl = await this.makeVisibleTabScreenshot(tab);
        await this.saveImage(tab, imageUrl, 'visibleTab');
      },
    });
    if (!onlyVisible) {
      await createContextMenu({
        id: 'makeFullSizeScreenshotMenu',
        parentId: 'mainContext',
        title: 'Make whole page screenshot',
        onclick: async (info, tab) => {
          const imageUrl = await this.makeFullSizeScreenshot(tab);
          await this.saveImage(tab, imageUrl, 'fullSize');
        },
      });
    }
  }

  isDisabledUrl(url) {
    return disabledUrls.find(disabledUrl => url.includes(disabledUrl));
  }

  setEvents() {
    chrome.browserAction.onClicked.addListener(() => chrome.runtime.openOptionsPage());
    chrome.tabs.onUpdated.addListener(async (tabId, { status }) => {
      if (status === 'complete') {
        const [{ url }] = await getTab({ active: true });
        this.createContextMenu(this.isDisabledUrl(url));
      }
    });
    chrome.tabs.onActivated.addListener(async () => {
      const [{ url }] = await getTab({ active: true });
      this.createContextMenu(this.isDisabledUrl(url));
    });
    chrome.runtime.onMessage.addListener(({ action, module, data }, sender, sendResponse) => {
      if (module !== 'screenshoter' || typeof this[action] !== 'function') {
        return false;
      }
      this[action]({ data, sender, sendResponse });
      return true;
    });
  }
}
