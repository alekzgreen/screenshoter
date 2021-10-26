import browser from 'webextension-polyfill';

export default {
  state: {
    image: null,
  },
  mutations: {
    set(state, data) {
      Object.assign(state, data);
    },
  },
  actions: {
    async init({ commit }) {
      const { cachedImage: image } = await browser.storage.local.get('cachedImage');
      window.CACHED_IMAGE = image;
      commit('set', { image });
    },
  },
};
