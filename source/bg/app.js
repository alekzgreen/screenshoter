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
    await browser.storage.local.set({ cachedImage: url });
    await browser.tabs.create({ url: browser.extension.getURL('settings.html') });
  }

  async makeFullPageScreenshot(tab) {
    console.time('makescreen');
    const { host } = new URL(tab.url);
    const now = Date.now();
    await this.executeScripts(tab.id);
    const [pageSizes] = await Promise.all([
      browser.tabs.sendMessage(tab.id, { action: 'getPageSizes' }),
      browser.tabs.sendMessage(tab.id, { action: 'scrollToStart' }),
    ]);
    const results = await this.capturer.makeFullSizeScreenshot({ tabId: tab.id, pageSizes });
    console.timeEnd('makescreen');
    if (results.length > 1) {
      await Promise.all(
        results.map(async (url, index) => {
          const name = `${host}-${now}-fullpage-screenshot-${index}.png`;
          await this.downloads.download({ url, name });
        }),
      );
    }
    if (pageSizes.height < 7500) {
      await browser.storage.local.set({ cachedImage: results[0] });
      await browser.tabs.create({ url: browser.extension.getURL('settings.html') });
    }
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
