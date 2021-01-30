import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/storage';
/* eslint class-methods-use-this:
["error", { "exceptMethods": ["initFirebase", "getFileRef", "createShortLink"] }] */
export default class FireSaver {
  constructor(config) {
    this.config = config;
    this.initFirebase();
  }

  initFirebase() {
    firebase.initializeApp(this.config);
  }

  getFileRef(path) {
    return firebase.storage().ref().child(path);
  }

  async createShortLink(fullUrl) {
    const url = 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=';
    const apiKey = 'AIzaSyB7IG2gAqcU5XTepnCHYaQk5bhX_Mqo34Y';
    try {
      const response = await fetch(`${url}${apiKey}`, {
        method: 'POST',
        body: JSON.stringify({
          longDynamicLink: `https://t1nylink.page.link/?link=${encodeURIComponent(fullUrl)}`,
        }),
      });
      return response.json();
    } catch (e) {
      return null;
    }
  }

  async upload(dataUrl, path) {
    try {
      const fileRef = this.getFileRef(path);
      const snapshot = await fileRef.putString(dataUrl, 'data_url');
      const downloadUrl = await snapshot.ref.getDownloadURL();
      return downloadUrl;
    } catch (e) {
      console.log('Can not upload file to firebase storage');
    }
    return null;
  }
}
