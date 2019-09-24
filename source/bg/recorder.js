import {
  each, merge, remove, find,
} from 'lodash';
import firebase from 'firebase/app';
import { formats, qualities } from '../constants';
import { getStorageData, setStorageData, uuidv4 } from '../utils';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/functions';
/* eslint class-methods-use-this:
["error", { "exceptMethods": ["saveSettings"] }] */
export default class Recorder {
  constructor() {
    document.body.insertAdjacentHTML('afterbegin', '<video autoplay></video>');
    this.state = 'default'; // recording/pause/default/permission
    this.savedChunks = null;
    this.filename = null;
    this.video = document.querySelector('video');
    this.init();
    this.setEvents();
  }

  init() {
    firebase.initializeApp({
      apiKey: 'AIzaSyC2xdh2Lj0g-OlbhUpyPfieBuYuXubN5jk',
      authDomain: 'aperture-video.firebaseapp.com',
      databaseURL: 'https://aperture-video.firebaseio.com',
      projectId: 'aperture-video',
      storageBucket: 'aperture-video.appspot.com',
      messagingSenderId: '1079459433904',
    });
    getStorageData(['settings', 'videos']).then(({ settings, videos }) => {
      console.log(settings);
      this.settings = merge(
        {
          format: 'webm',
          quality: 'normal',
          microphone: false,
          userId: uuidv4(),
        },
        settings,
      );
      this.videos = videos || [];
      this.checkVideos()
        .then(() => this.save())
        .catch(() => this.save());
    });
  }

  async checkVideos() {
    await this.checkOldVideos();
    const promises = [];
    each(this.videos, (video) => {
      promises.push(
        firebase
          .storage()
          .ref()
          .child(video.fullPath)
          .getDownloadURL()
          .catch(() => null)
          .then((url) => {
            if (!url) {
              return remove(this.videos, ({ fullPath }) => video.fullPath === fullPath);
            }
            return false;
          }),
      );
    });
    await Promise.all(promises);
  }

  checkOldVideos() {
    const storingTime = 14 * 24 * 60 * 60 * 1000;
    const oldVideos = [];
    each(this.videos, ({ timeCreated, fullPath }) => {
      const isOld = Date.now() - new Date(timeCreated) > storingTime;
      if (isOld) {
        oldVideos.push(fullPath);
      }
    });
    if (oldVideos.length) {
      const message = firebase.functions().httpsCallable('checkOldVideos');
      return message({ oldVideos });
    }
    return Promise.resolve(true);
  }

  /* eslint-disable */
  createShortLink(data) {
    const { apiUrl, apiKey, url, title } = data;
    return fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', apikey: apiKey },
      body: JSON.stringify({
        destination: url,
        title,
      }),
    }).then((response) => response.json());
  }
  /* eslint-enable */

  save() {
    setStorageData({ settings: this.settings, videos: this.videos });
  }

  setEvents() {
    chrome.browserAction.onClicked.addListener(() => this.check());
  }

  startStream() {
    const promises = [Recorder.getVideoStream()];
    if (this.settings.microphone) {
      promises.push(Recorder.getAudioStream());
    }
    return Promise.all(promises);
  }

  static getAudioStream() {
    return navigator.mediaDevices.getUserMedia({
      audio: true,
    });
  }

  static getSystemAudio({ streamId, canRequestAudioTrack }) {
    if (canRequestAudioTrack) {
      return {
        mandatory: {
          chromeMediaSourceId: streamId,
          chromeMediaSource: 'system',
        },
      };
    }
    return false;
  }

  static getVideoStream() {
    const params = {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          minWidth: global.screen.width * global.devicePixelRatio,
          maxWidth: global.screen.width * global.devicePixelRatio,
          minHeight: global.screen.height * global.devicePixelRatio,
          maxHeight: global.screen.height * global.devicePixelRatio,
          minFrameRate: 24,
        },
      },
    };
    return new Promise((resolve, reject) => {
      const permissions = ['screen', 'window', 'tab', 'audio'];
      chrome.desktopCapture.chooseDesktopMedia(permissions, (streamId, options) => {
        const { canRequestAudioTrack } = options;
        if (!streamId) {
          return reject();
        }
        return navigator.webkitGetUserMedia(
          merge(params, {
            video: {
              mandatory: {
                chromeMediaSourceId: streamId,
              },
            },
            audio: Recorder.getSystemAudio({ streamId, canRequestAudioTrack }),
          }),
          resolve,
          reject,
        );
      });
    });
  }

  static stopStream(stream) {
    const tracks = stream.getTracks();
    each(tracks, track => track.stop());
    stream = null; // eslint-disable-line
  }

  static getVideoUrl(chunks) {
    const type = 'video/webm;codecs=h264,vp9,opus';
    const videoBlob = new Blob(chunks, { type });
    return global.URL.createObjectURL(videoBlob);
  }

  record([videoStream, audioStream]) {
    if (audioStream) {
      videoStream.addTrack(audioStream.getTracks()[0]);
    }
    this.savedChunks = [];
    const { recorderType } = formats[this.settings.format];
    const { videoBitsPerSecond } = qualities[this.settings.quality];
    this.recorder = new MediaRecorder(videoStream, {
      mimeType: recorderType,
      videoBitsPerSecond,
    });
    this.setRecorderEvents(videoStream);
    this.recorder.start(1000);
  }

  setRecorderEvents(stream) {
    this.recorder.onstart = () => {
      this.filename = uuidv4();
      this.state = 'recording';
      this.setIcon();
      chrome.contextMenus.removeAll();
      chrome.contextMenus.create({
        title: 'Pause recording',
        onclick: () => this.recorder.pause(),
      });
    };

    this.recorder.ondataavailable = e => this.savedChunks.push(e.data);

    this.recorder.onpause = () => {
      this.state = 'pause';
      this.setIcon();
      chrome.contextMenus.removeAll();
      chrome.contextMenus.create({
        title: 'Resume recording',
        onclick: () => this.recorder.resume(),
      });
    };

    this.recorder.onresume = () => {
      this.state = 'recording';
      this.setIcon();
      chrome.contextMenus.removeAll();
      chrome.contextMenus.create({
        title: 'Pause recording',
        onclick: () => this.recorder.pause(),
      });
    };

    this.recorder.onstop = () => {
      this.state = 'default';
      this.setIcon();
      Recorder.stopStream(stream);
      chrome.tabs.query({}, (tabs) => {
        const optionsUrl = `chrome-extension://${chrome.runtime.id}/settings.html`;
        const optionsTab = find(tabs, ({ url }) => url === optionsUrl);
        if (optionsTab) {
          chrome.tabs.reload(optionsTab.id);
          chrome.tabs.update(optionsTab.id, { active: true, highlighted: true });
        } else {
          chrome.runtime.openOptionsPage();
        }
      });
      chrome.contextMenus.removeAll();
    };

    this.recorder.onerror = (e) => {
      this.state = 'default';
      this.setIcon();
      Recorder.stopStream(stream);
      this.savedChunks = [];
      chrome.contextMenus.removeAll();
      console.error(e);
    };
  }

  setIcon(state) {
    const images = {
      default: '../icon-disabled-32.png',
      recording: '../icon-32.png',
      pause: '../icon-paused-32.png',
      permission: '../icon-disabled-32.png',
    };
    chrome.browserAction.setIcon({ path: images[state || this.state] });
  }

  check() {
    switch (this.state) {
      case 'default':
        this.state = 'permission';
        this.setIcon();
        return this.startStream()
          .then((stream) => {
            this.record(stream);
          })
          .catch(() => {
            this.state = 'default';
            this.setIcon();
          });
      case 'recording':
      case 'pause':
        this.recorder.stop();
        break;
      case 'permission':
        return false;
      default:
        return false;
    }
    return false;
  }

  saveSettings(settings) {
    setStorageData({ settings: settings || this.settings });
  }
}
