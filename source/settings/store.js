import { getStorageData } from '../utils';

export default {
  state: {
    currentSection: 'content',
    sections: {
      content: {
        title: 'Saved Images',
      },
    },
    images: null,
  },
  mutations: {
    set(state, data) {
      Object.assign(state, data);
    },
  },
  actions: {
    async init({ commit }) {
      const { images } = await getStorageData('images');
      commit('set', { images });
    },
  },
};
