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
  z-index: 1;
  justify-content: flex-end;
  box-sizing: border-box;

  &__items {
    display: flex;
    flex-direction: column;
  }

  &__item {
    display: flex;
    align-items: center;
    margin-bottom: 10px;
    padding-left: 25px;
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
    left: 0;
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
