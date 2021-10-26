/* eslint class-methods-use-this: ["error", {
  "exceptMethods": [
    "makeFullSizeScreenshot",
    "makeVisibleTabScreenshot",
    "makeViewPortScreenshot",
    "printToPDF"
  ]
}] */
import browser from 'webextension-polyfill';
import { asyncTimeout } from '../utils';

export default class Capturer {
  async makeFullSizeScreenshot({ tabId, pageSizes }) {
    const { width, height, ratio } = pageSizes;
    const shotHeight = Math.min(height, 15500 / ratio);
    const viewport = {
      x: 0, y: 0, scale: 1, width, height: shotHeight,
    };
    await browser.debugger.attach({ tabId }, '1.2');
    await browser.debugger.sendCommand({ tabId }, 'Emulation.setDeviceMetricsOverride', {
      mobile: false,
      width,
      height: shotHeight,
      deviceScaleFactor: ratio,
      viewport,
    });
    await asyncTimeout(1000);
    const result = await this.makeViewPortScreenshot(tabId, viewport);
    await browser.debugger.detach({ tabId });
    return `data:image/png;base64,${result?.data}`;
  }

  makeViewPortScreenshot(tabId, viewport) {
    return new Promise((resolve) => {
      chrome.debugger.sendCommand({ tabId }, 'Page.captureScreenshot', {
        format: 'png', clip: viewport,
      }, resolve);
    });
  }

  async makeVisibleTabScreenshot({ windowId }) {
    return browser.tabs.captureVisibleTab(windowId);
  }

  async printToPDF({ tabId }) {
    await browser.debugger.attach({ tabId }, '1.3');
    const result = await browser.debugger.sendCommand({ tabId }, 'Page.printToPDF', {});
    return `data:application/pdf;base64,${result.data}`;
  }
}
