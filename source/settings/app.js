import Vue from 'vue/dist/vue.common';
import Vuex from 'vuex';
import vueStore from './store';
import App from './app.vue';

Vue.use(Vuex);

class Content {
  constructor() {
    this.init();
  }

  async init() {
    const store = new Vuex.Store(vueStore);
    await store.dispatch('init');
    this.app = new Vue({
      el: document.querySelector('#app'),
      store,
      render: (h) => h(App),
    });
  }
}

global.content = new Content();
