<template>
  <div class="section">
    <Slider :items="sortedDates" v-if="sortedDates"/>
    <div class="content" v-if="sortedSections">
      <div
        class="content__section"
        v-for="(section, index) in sortedSections" :key="index">
        <div :section-id="section.id" class="content__title">{{ section.title }}</div>
        <div class="content__items">
          <Thumbnail v-for="(image, index) in section.items" :key="index" :image="image"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Thumbnail from './thumbnail.vue';
import Slider from './slider.vue';
import { copyToClipboard, getMonthYear } from '../../utils';

export default {
  components: {
    Thumbnail,
    Slider,
  },
  data() {
    return {
      sortedSections: null,
      sortedDates: [],
    };
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
    sortImages() {
      const results = [];
      const array = Object.entries(this.images);
      let sectionId = 0;
      array
        .sort(([, aImage], [, bImage]) => bImage.created - aImage.created)
        .forEach(([id, image], index) => {
          const previousDate = getMonthYear(array[index - 1]?.[1].created || Date.now());
          const imageDate = getMonthYear(image.created);
          if (!results.length || imageDate !== previousDate) {
            sectionId += 1;
            results.push({ id: sectionId, items: [], title: imageDate });
            this.sortedDates.push({ id: sectionId, title: imageDate });
          }
          results[results.length - 1].items.push({ id, ...image });
        });
      this.sortedSections = results;
      console.log('this.sortedImages', this.sortedSections);
      return results;
    },
  },
  watch: {
    images() {
      this.sortImages();
    },
  },
};
</script>

<style lang="less">
.content {
  width: 100%;
  overflow: hidden;
  overflow-y: auto;
  margin-top: 60px;

  &__title {
    font-size: 24px;
    font-weight: 600;
    color: #fff;
    grid-area: header;
  }

  &__items {
    display: grid;
    grid-template-columns: repeat(auto-fill, 290px);
    grid-template-rows: auto;
    grid-column-gap: 40px;
    grid-row-gap: 40px;
    margin-top: 30px;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    overflow-y: auto;
  }

  &__section {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0 50px 0 170px;
    margin: 50px 0 10px 0;
  }
}
</style>
