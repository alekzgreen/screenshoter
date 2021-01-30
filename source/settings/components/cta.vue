<template>
  <div class="cta"></div>
</template>

<script>
export default {
  props: ['action'],
};
</script>

<style lang="less">
.cta {
  display: flex;
  flex-shrink: 0;
  width: 35px;
  height: 35px;
  background-color: #e2e2e2;
  border-radius: 8px;
  align-items: center;
  cursor: pointer;
  justify-content: center;
  transition: background-color .3s;

  &:hover {
    background-color: #d6d6d6;
  }

  svg {
    width: 60%;
    width: 60%;
    fill: #3c3c3c;
  }
}
</style>
