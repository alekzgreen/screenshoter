<template>
  <div class="navigation">
    <div class="navigation__items">
      <div
        class="navigation__item"
        v-for="(section, name, index) in sections"
        :key="index"
        @click="toggleSection(name)"
        :class="[
          `navigation__item_${name}`,
          currentSection === name && 'navigation__item_active']"
      >
        {{ section.title }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    currentSection() {
      return this.$store.state.currentSection;
    },
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
  width: 100%;
  height: 60px;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  background-color: #363635;
  padding: 0 30px;
  justify-content: flex-end;
  box-sizing: border-box;
  min-width: 800px;

  &__items {
    display: flex;
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
    align-items: center;
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
      background-color: #f9d383;
      position: absolute;
      bottom: 0;
    }

    &:hover {
      color: #f9d383;
    }

    &_active {
      color: #f9d383;
      &:after {
        width: 30px;
      }
    }

    &_instant, &_infinite {
      background-image: url(../../assets/instant.png);
      background-repeat: no-repeat;
      background-size: 20px;
      background-position: 0 center;
      padding: 0 20px 0 25px;
      color: #fdc600;

      &:hover {
        color: #fdc600;
      }
    }

    &_infinite {
      background-image: url(../../assets/infinite.png);
      color: #81d9e7;

      &:hover {
        color: #f671a7;
      }
    }
  }
}
</style>
