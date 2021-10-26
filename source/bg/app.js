/* eslint class-methods-use-this: ["error", {
  "exceptMethods": [
    "createContextMenu",
    "makeTabScreenshot",
    "makeFullPageScreenshot",
    "executeScripts"
  ]
}] */
import browser from 'webextension-polyfill';
import Capturer from './capturer';
import Downloads from './downloads';

class App {
  constructor() {
    this.capturer = new Capturer();
    this.downloads = new Downloads({ name: 'screenshots' });
    this.createContextMenu();
  }

  async createContextMenu() {
    const items = {
      captureTabItem: {
        id: 'captureTabItem',
        parentId: 'mainMenu',
        title: 'Capture this tab',
        handler: 'makeTabScreenshot',
      },
      makeFullSizeScreenshotItem: {
        id: 'makeFullSizeScreenshotItem',
        parentId: 'mainMenu',
        title: 'Make full page screenshot',
        handler: 'makeFullPageScreenshot',
      },
    };
    await browser.contextMenus.removeAll();
    await browser.contextMenus.create({ id: 'mainMenu', title: 'Frame' });
    Object.values(items)
      .map(({ handler, ...properties }) => browser.contextMenus.create(properties));
    browser.contextMenus.onClicked.addListener(({ menuItemId }, tab) => {
      const handlerName = items[menuItemId]?.handler;
      this[handlerName]?.(tab);
    });
  }

  async makeTabScreenshot(tab) {
    const url = await this.capturer.makeVisibleTabScreenshot(tab);
    await this.downloads.download({ url, name: `frame-tab-screenshot-${Date.now()}.jpeg` });
    await browser.storage.local.set({ cachedImage: url });
  }

  async makeFullPageScreenshot(tab) {
    await this.executeScripts(tab.id);
    const [pageSizes] = await Promise.all([
      browser.tabs.sendMessage(tab.id, { action: 'getPageSizes' }),
      browser.tabs.sendMessage(tab.id, { action: 'scrollToStart' }),
    ]);
    const url = await this.capturer.makeFullSizeScreenshot({ tabId: tab.id, pageSizes });
    await this.downloads.download({ url, name: `frame-fullpage-screenshot-${Date.now()}.png` });
    await browser.storage.local.set({ cachedImage: url });
  }

  async executeScripts(tabId) {
    try {
      await browser.tabs.sendMessage(tabId, { action: 'ping' });
    } catch (e) {
      const scripts = ['vendors/bundle.js', 'content/bundle.js'];
      await Promise.all(scripts.map((file) => browser.tabs.executeScript(tabId, { file })));
    }
  }
}

window.APP = new App();
