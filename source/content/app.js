import { asyncTimeout, sendContentMessage } from '../utils';

/* eslint class-methods-use-this: ["error", {
  "exceptMethods": [
    "ping",
    "getPageSizes",
    "scrollStart",
    "scrollEnd",
    "makeChunk",
    "saveChunks"
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

  async scrollEnd() {
    const { scrollHeight } = document.documentElement;
    document.documentElement.scroll(0, scrollHeight);
  }

  async makeChunk() {
    const { clientHeight, scrollHeight } = document.documentElement;
    await sendContentMessage({ action: 'saveChunk', module: 'screenshoter' });
    document.documentElement.scroll(0, window.scrollY - clientHeight);
    await asyncTimeout(500);
    console.log(1111, window.scrollY);
    if (window.scrollY) {
      console.log('!!!!!!!');
      return this.makeChunk();
    }
    await sendContentMessage({
      action: 'saveChunks',
      module: 'screenshoter',
      data: { scrollHeight, clientHeight },
    });
    return true;
  }

  ping({ sendResponse }) {
    sendResponse(true);
  }
}

global.content = new Content();
