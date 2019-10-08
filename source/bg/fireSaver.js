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
    /* firebase.initializeApp({
      apiKey: 'AIzaSyC2xdh2Lj0g-OlbhUpyPfieBuYuXubN5jk',
      authDomain: 'aperture-video.firebaseapp.com',
      databaseURL: 'https://aperture-video.firebaseio.com',
      projectId: 'aperture-video',
      storageBucket: 'aperture-video.appspot.com',
      messagingSenderId: '1079459433904',
    }); */
  }

  getFileRef(path) {
    return firebase.storage().ref().child(path);
  }

  createShortLink(fullUrl) {
    const url = 'https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=';
    const apiKey = 'AIzaSyB7IG2gAqcU5XTepnCHYaQk5bhX_Mqo34Y';
    try {
      const response = fetch(`${url}${apiKey}`, {
        method: 'POST',
        body: JSON.stringify({
          longDynamicLink: `https://t1nylink.page.link/?link=${fullUrl}`,
        }),
      });
      return response.json();
    } catch (e) {
      return null;
    }
  }

  async upload(dataUrl, path) {
    try {
      const fileRef = this.getFileReference(path);
      const snapshot = await fileRef.putString(dataUrl, 'data_url');
      return snapshot.ref.getDownloadURL();
    } catch (e) {
      console.log('Can not upload file to firebase storage');
    }
    return null;
  }
}
