/* eslint-disable */
const promiseWrapper = (parent, method) => {
  return function() {
    const newArguments = [...arguments];
    return new Promise((resolve) => {
      newArguments.push(function () {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
        }
        return resolve(...arguments);
      });
      parent[method].apply(parent, newArguments);
    });
  };
};
/* eslint-enable */

const attachDebugger = promiseWrapper(chrome.debugger, 'attach');
const detachDebugger = promiseWrapper(chrome.debugger, 'detach');
const sendCommand = promiseWrapper(chrome.debugger, 'sendCommand');
const createTab = promiseWrapper(chrome.tabs, 'create');
const getTab = promiseWrapper(chrome.tabs, 'query');
const captureVisibleTab = promiseWrapper(chrome.tabs, 'captureVisibleTab');
const getCurrentTab = promiseWrapper(chrome.tabs, 'getCurrent');
const downloadFile = promiseWrapper(chrome.downloads, 'download');
const createContextMenu = promiseWrapper(chrome.contextMenus, 'create');
const removeAllContextMenus = promiseWrapper(chrome.contextMenus, 'removeAll');
const asyncTimeout = async t => new Promise(r => setTimeout(() => r(true), t));

const createVideoUrl = (chunks, type) => {
  const blob = new Blob(chunks, { type: type || 'video/webm;codecs=h264,vp9,opus' });
  return global.URL.createObjectURL(blob);
};

const getBlobSizeInMB = (chunks, type) => {
  if (chunks && chunks.length) {
    const blob = new Blob(chunks, { type: type || 'video/webm;codecs=h264,vp9,opus' });
    return blob.size / 1024 / 1024;
  }
  return 0;
};

const getStorageData = (keys) => {
  const promise = new Promise((resolve, reject) => {
    chrome.storage.local.get(keys, (items) => {
      if (chrome.runtime.lastError) {
        reject(new Error(`Error in storage.get: ${chrome.runtime.lastError}`));
      } else {
        resolve(items);
      }
    });
  });
  return promise;
};

const setStorageData = i => new Promise(r => chrome.storage.local.set(i, () => r(true)));
/* eslint-disable */
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
/* eslint-enable */

const createShortLink = (data) => {
  const {
    apiUrl, apiKey, url, title,
  } = data;
  return fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: apiKey },
    body: JSON.stringify({
      destination: url,
      title,
    }),
  });
};

const makeSnapshot = ({ video, type, scale = 1 }) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = video.videoWidth * scale;
  canvas.height = video.videoHeight * scale;
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve) => {
    if (type === 'blob') {
      canvas.toBlob(blob => resolve(blob));
    } else {
      resolve(canvas.toDataURL());
    }
  }).catch(() => null);
};

const executeScripts = (tabId, scripts) => {
  const promises = scripts.map((file) => {
    const promise = new Promise((resolve) => {
      chrome.tabs.executeScript(tabId, { file }, () => resolve(true));
    });
    return promise;
  });
  return Promise.all(promises);
};

const copyToClipboard = (value) => {
  const input = document.createElement('input');
  document.body.appendChild(input);
  input.value = value;
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
};

const sendContentMessage = (params) => {
  const promise = new Promise((resolve) => {
    chrome.runtime.sendMessage(params, (response) => {
      resolve(response);
    });
  });
  return promise;
};

const sendBackgroundMessage = (tabId, params) => {
  const promise = new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, params, (response) => {
      if (chrome.runtime.lastError) {
        return reject(new Error(chrome.runtime.lastError.message));
      }
      return resolve(response);
    });
  });
  return promise;
};

export {
  createVideoUrl,
  getStorageData,
  setStorageData,
  uuidv4,
  createShortLink,
  makeSnapshot,
  copyToClipboard,
  sendContentMessage,
  sendBackgroundMessage,
  getBlobSizeInMB,
  executeScripts,
  detachDebugger,
  attachDebugger,
  sendCommand,
  createTab,
  asyncTimeout,
  downloadFile,
  captureVisibleTab,
  createContextMenu,
  getCurrentTab,
  getTab,
  removeAllContextMenus,
};
