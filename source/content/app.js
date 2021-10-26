import browser from 'webextension-polyfill';
import { asyncTimeout } from '../utils';

/* eslint class-methods-use-this: ["error", {
  "exceptMethods": [
    "ping",
    "getPageSizes",
    "scrollToStart",
  ]
}] */

class Content {
  constructor() {
    this.setEvents();
  }

  setEvents() {
    browser.runtime.onMessage.addListener(async ({ action, data }) => this[action]?.(data));
  }

  getPageSizes() {
    const { scrollHeight } = document.documentElement;
    const data = {
      width: window.screen.width, height: scrollHeight, ratio: window.devicePixelRatio,
    };
    return data;
  }

  async scrollToStart() {
    window.scrollTo(0, 0);
    return asyncTimeout(500);
  }

  ping() {
    return true;
  }
}

global.content = new Content();
