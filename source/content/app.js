import { asyncTimeout } from '../utils';

/* eslint class-methods-use-this: ["error", {
  "exceptMethods": [
    "ping",
    "getPageSizes",
    "scrollStart"
  ]
}] */

class Content {
  constructor() {
    this.setEvents();
  }

  setEvents() {
    chrome.runtime.onMessage.addListener(({ action, module, data }, sender, sendResponse) => {
      if (module !== 'content' || typeof this[action] !== 'function') {
        return false;
      }
      this[action]({ data, sender, sendResponse });
      return true;
    });
  }

  getPageSizes({ sendResponse }) {
    const { scrollHeight, clientHeight } = document.documentElement;
    sendResponse({ scrollHeight, clientHeight, ratio: window.devicePixelRatio });
  }

  async scrollStart({ sendResponse }) {
    window.scrollTo(0, 0);
    await asyncTimeout(500);
    sendResponse(true);
  }

  ping({ sendResponse }) {
    sendResponse(true);
  }
}

global.content = new Content();
