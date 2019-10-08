<template>
  <div class="navigation">
    <div class="navigation__items">
      <div
        class="navigation__item"
        v-for="(section, name, index) in sections"
        :key="index"
        @click="toggleSection(name)"
      >
        {{ section.title }}
      </div>
      <div class="navigation__item">Gallery</div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    sections() {
      return this.$store.state.sections;
    },
  },
  methods: {
    toggleSection(currentSection) {
      this.$store.commit('set', { currentSection });
    },
    openLink(url) {
      chrome.tabs.create({ url, active: true });
    },
  },
};
</script>

<style lang="less">
.navigation {
  display: flex;
  width: 240px;
  height: 100%;
  flex-direction: column;
  z-index: 1;
  background-color: #121212;
  box-sizing: border-box;
  box-shadow: 0 0px 15px 0 #121212;

  &__items {
    display: flex;
    width: 100%;
    justify-content: space-evenly;
    height: 150px;
    flex-direction: column;
  }

  &__item {
    display: flex;
    user-select: none;
    position: relative;
    flex-direction: column;
    color: #f1f1f1;
    font-size: 12px;
    text-transform: uppercase;
    font-weight: 600;
    justify-content: center;
    align-items: flex-start;
    letter-spacing: 0.3px;
    padding: 0 20px;
    cursor: pointer;
    transition: color 0.3s;

    &:after {
      content: ' ';
      display: flex;
      width: 0;
      height: 2px;
      transition: width 0.3s;
      background-color: #c1494f;
      position: absolute;
      bottom: 0;
    }

    &:hover {
      color: #c1494f;
    }

    &_active {
      color: #c1494f;
      &:after {
        width: 30px;
      }
    }
  }
}
</style>
