<template>
  <div class="app">
    <tui-image-editor ref="tuiImageEditor" :include-ui="useDefaultUI" :options="options" />
    <div class="cta cta_download" @click="download">Download</div>
  </div>
</template>

<script>
import browser from 'webextension-polyfill';
/* eslint-disable import/no-extraneous-dependencies */
import { ImageEditor } from '@toast-ui/vue-image-editor';

export default {
  components: {
    'tui-image-editor': ImageEditor,
  },
  data() {
    return {
      useDefaultUI: true,
    };
  },
  computed: {
    image() {
      return this.$store.state.image;
    },
    options() {
      return {
        includeUI: {
          loadImage: {
            path: this.image,
            name: 'SampleImage',
          },
        },
        // for tui-image-editor component's "options" prop
        cssMaxWidth: 1440,
        cssMaxHeight: 900,
      };
    },
  },
  methods: {
    download() {
      const { APP } = browser.extension.getBackgroundPage();
      const url = this.$refs.tuiImageEditor.invoke('toDataURL');
      APP.downloads.download({ url, name: `frame-${Date.now()}-screenshot.png` }, true);
    },
  },
};
</script>
<style lang="less">
@import '../styles.less';
@import 'tui-color-picker/dist/tui-color-picker.css';
@import 'tui-image-editor/dist/tui-image-editor.css';

.app {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  background-color: #4c4c4c;
  margin: 0;
  flex-direction: column;
}

.tui-image-editor-header-logo, .tui-image-editor-header-buttons {
  display: none;
}

.cta {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: normal;
  font-size: 14px;
  font-family: Arial, Helvetica, sans-serif;
  font-weight: bold;
  color: #fff;
  background-color: #c1494f;
  border-radius: 20px;
  padding: 0 20px;
  height: 40px;
  cursor: pointer;

  &_download {
    position: absolute;
    top: 8px;
    right: 20px
  }
}
</style>
