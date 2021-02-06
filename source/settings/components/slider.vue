<template>
  <div class="slider">
    <div class="slider__items">
      <div
        :class="['slider__item', currentIndex === index && 'slider__item_selected']"
        v-for="(section, index) in items"
        :key="index"
        @click="toggleItem(index)">
          <div class="slider__dot"></div>
          <div class="slider__title">{{ section.title }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['items'],
  data() {
    return {
      currentIndex: 0,
    };
  },
  methods: {
    toggleItem(index) {
      this.currentIndex = index;
      const sectionEl = document.querySelector(`[section-id="${this.items[index].id}"]`);
      return sectionEl?.scrollIntoView({ behavior: 'smooth' });
    },
  },
};
</script>

<style lang="less">
.slider {
  display: flex;
  position: fixed;
  flex-direction: column;
  top: 100px;
  left: 20px;
  width: 130px;
  z-index: 1;
  box-sizing: border-box;
  height: calc(~'100% - 200px');
  justify-content: flex-start;
  overflow: hidden;

  &__items {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: calc(~'100% + 50px');
    overflow: hidden;
    overflow-y: auto;
  }

  &__item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding-left: 28px;
    cursor: pointer;

    &:hover .slider__dot {
      transform: scale(1.3,1.3);
    }

    &_selected .slider__dot {
      transform: scale(1.5,1.5) !important;
    }

    &:hover .slider__title {
      transform: scale(1.1,1.1);
    }

    &_selected  .slider__title {
      transform: scale(1.2,1.2) !important;
      color: rgba(255,255,255,0.9);
    }
  }

  &__dot {
    display: flex;
    position: absolute;
    width: 8px;
    left: 3px;
    height: 8px;
    border-radius: 8px;
    background-color: #2f2f2f;
    transition: transform .3s, color .3s;
  }

  &__title {
    transition: transform .3s;
    color: rgba(255,255,255,0.6);
  }
}
</style>
