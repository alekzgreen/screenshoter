import Vue from 'vue/dist/vue.common';
import Vuex from 'vuex';
import store from './store';
import App from './app.vue';

Vue.use(Vuex);

global.app = new Vue({
  el: document.querySelector('#app'),
  store: new Vuex.Store(store),
  render: h => h(App),
});
