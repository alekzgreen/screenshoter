<template>
  <div class="wrapper">
    <Navigation />
  </div>
</template>
<script>
import Navigation from './components/navigation.vue';

export default {
  components: {
    Navigation,
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
html,
body {
  width: 300px;
  height: 300px;
  padding: 0;
  margin: 0;
  background-color: #373737;
  font-family: Helvetica, Arial, sans-serif;
}

body {
  display: flex;
  justify-content: flex-end;
  padding: 0;
  margin: 0;
}

.wrapper {
  display: flex;
}
</style>
