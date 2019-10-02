<template>
  <div class="section">
    <div class="content">
      <Thumbnail v-for="(image, key, index) in images" :key="index" :id="key" :image="image" />
    </div>
  </div>
</template>

<script>
import Thumbnail from './thumbnail.vue';
import { copyToClipboard } from '../../utils';

export default {
  components: {
    Thumbnail,
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
  grid-template-columns: repeat(auto-fill, 160px);
  grid-template-rows: auto;
  grid-column-gap: 25px;
  grid-row-gap: 25px;
  margin-top: 60px;
  width: 100%;
  box-sizing: border-box;
  padding: 50px;
  overflow: hidden;
  overflow-y: auto;
  justify-content: center;

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    grid-area: header;
  }
}
</style>
