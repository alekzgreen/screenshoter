<template>
  <div class="wrapper">
    <Navigation />
    <keep-alive>
      <component :is="currentSection"></component>
    </keep-alive>
  </div>
</template>
<script>
import Navigation from './components/navigation.vue';
import Content from './components/content.vue';

export default {
  components: {
    Navigation,
    Content,
  },
  computed: {
    currentSection() {
      const section = this.$store.state.currentSection;
      return section.charAt(0).toUpperCase() + section.slice(1);
    },
  },
  created() {
    this.$store.dispatch('init');
  },
};
</script>
<style lang="less">
@import '../styles.less';

.wrapper {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
  background-color: #595a4a;
  margin: 0;
  flex-direction: column;
}

.section {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  width: 100%;
  height: 100%;
  align-items: center;
}
</style>
