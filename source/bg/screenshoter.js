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

/* import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/functions'; */

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

export default class Screenshoter {
  constructor() {
    // this.init();
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
    let { images } = await getStorageData('images');
    images = images || {};
    const id = this.generateUniqueId(Object.keys(images));
    images[id] = {
      url,
      title,
      imageUrl,
      type,
      created: Date.now(),
    };
    setStorageData({ images });
  }

  async deleteImage(id) {
    const { images } = await getStorageData('images');
    delete images[id];
    await setStorageData({ images });
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
      console.log(tab);
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

  /* makeTabScreen({ windowId }) {
    return new Promise((resolve) => {
      chrome.tabs.captureVisibleTab(windowId, { format: 'png' }, (dataUrl) => {
        resolve(dataUrl);
      });
    });
  }

  shot({ data, sendResponse }) {
    const { state } = data;
    if (state === 'start') {
      this.frames = [];
    }
    this.makeTabScreen().then((dataUrl) => {
      this.frames.push(dataUrl);
      sendResponse(true);
    });
  }

  init() {
    firebase.initializeApp({
      apiKey: 'AIzaSyCXOnKAh8JJHsWUkAiM63tFXpe0fSOZPfg',
      authDomain: 'screenshooter-58c94.firebaseapp.com',
      databaseURL: 'https://screenshooter-58c94.firebaseio.com',
      projectId: 'screenshooter-58c94',
      storageBucket: 'screenshooter-58c94.appspot.com',
      messagingSenderId: '271946534911',
      appId: '1:271946534911:web:abdccfda9f1934b36ea1ca',
    });
  } */
}