export default {
  state: {
    currentSection: 'content',
    sections: {
      full: {
        title: 'Full-page screenshot',
      },
      visible: {
        title: 'Capture visible zone',
      },
    },
    images: null,
  },
  mutations: {
    set(state, data) {
      Object.assign(state, data);
    },
  },
};
