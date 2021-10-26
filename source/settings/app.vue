<template>
  <div class="app">
    <tui-image-editor ref="tuiImageEditor" :include-ui="useDefaultUI" :options="options" />
  </div>
</template>

<script>
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
        cssMaxWidth: 700,
        cssMaxHeight: 500,
      };
    },
  },
  mounted() {
    console.log(this);
    // eslint-disable-next-line no-unused-vars
    /* this.$refs.tuiImageEditor.invoke('addImageObject', '../icon-32.png').then((objectProps) => {
      console.log(objectProps);
    }); */
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
</style>
