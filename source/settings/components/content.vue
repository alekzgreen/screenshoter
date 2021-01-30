<template>
  <div class="section">
    <Slider :items="[{ title: 'jan 2021' }, { title: 'feb 2021' }, { title: 'march 2021' }]" />
    <div class="content">
      <Thumbnail v-for="(image, key, index) in images" :key="index" :id="key" :image="image" />
    </div>
  </div>
</template>

<script>
import Thumbnail from './thumbnail.vue';
import Slider from './slider.vue';
import { copyToClipboard } from '../../utils';

export default {
  components: {
    Thumbnail,
    Slider,
  },
  computed: {
    images() {
      return this.$store.state.images;
    },
  },
  filters: {
    date(value) {
      return new Date(value).toLocaleDateString();
    },
  },
  methods: {
    copyLink(link) {
      copyToClipboard(link);
    },
    openVideo(link) {
      window.open(link, 'blank_');
    },
  },
};
</script>

<style lang="less">
.content {
  display: grid;
  grid-template-columns: repeat(auto-fill, 290px);
  grid-template-rows: auto;
  grid-column-gap: 40px;
  grid-row-gap: 40px;
  margin-top: 60px;
  width: 100%;
  box-sizing: border-box;
  padding: 50px 50px 50px 160px;
  overflow: hidden;
  overflow-y: auto;

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    grid-area: header;
  }
}
</style>
