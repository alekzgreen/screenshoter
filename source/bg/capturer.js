/* eslint-disable no-restricted-syntax */
/* eslint class-methods-use-this: ["error", {
  "exceptMethods": [
    "makeFullSizeScreenshot",
    "makeVisibleTabScreenshot",
    "makeViewPortScreenshot",
    "printToPDF",
    "getViewPorts",
  ]
}] */
import browser from 'webextension-polyfill';
import { asyncTimeout } from '../utils';

export default class Capturer {
  async makeFullSizeScreenshot({ tabId, pageSizes }) {
    const { width, height, ratio } = pageSizes;
    const viewPorts = this.getViewPorts({ width, height, ratio });
    await browser.debugger.attach({ tabId }, '1.2');
    await browser.debugger.sendCommand({ tabId }, 'Emulation.setDeviceMetricsOverride', {
      mobile: false,
      width,
      height: 10000000,
      deviceScaleFactor: ratio,
    });
    await asyncTimeout(1000);
    const results = [];
    for await (const viewport of viewPorts) {
      const result = await this.makeViewPortScreenshot(tabId, viewport);
      const url = `data:image/png;base64,${result?.data}`;
      results.push(url);
    }
    await browser.debugger.detach({ tabId });
    return results;
  }

  makeViewPortScreenshot(tabId, viewport) {
    return new Promise((resolve) => {
      chrome.debugger.sendCommand({ tabId }, 'Page.captureScreenshot', {
        format: 'png', clip: viewport,
      }, resolve);
    });
  }

  // eslint-disable-next-line object-curly-newline
  getViewPorts({ width, height, ratio, viewports = [] }) {
    if (height > 0) {
      const shotHeight = Math.min(height, 15000 / ratio);
      const prevViewport = viewports.at(-1);
      const y = prevViewport ? prevViewport.y + prevViewport.height : 0;
      const viewport = {
        x: 0, y, scale: 1, width, height: shotHeight,
      };
      viewports.push(viewport);
      // eslint-disable-next-line object-curly-newline
      return this.getViewPorts({ width, height: height - shotHeight, ratio, viewports });
    }
    return viewports;
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
