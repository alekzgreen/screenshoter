<template>
  <div
    :class="['thumbnail', removing && 'thumbnail_deleted']">
    <div class="thumbnail__image" :style="{backgroundImage: `url(${image.imageUrl})`}"></div>
    <div
      class="thumbnail__icon thumbnail__icon_delete"
      v-html="require('!!svg-inline-loader!../../assets/close.svg')"
      @click.stop="remove"
    ></div>
    <div class="thumbnail__info">
      <div class="thumbnail__ctas">
          <div
          class="thumbnail__icon"
          v-html="require('!!svg-inline-loader!../../assets/download.svg')"
          :style="{ marginRight: '10px' }"
          @click="download"
        ></div>
        <div class="thumbnail__delimeter"></div>
        <div
          class="thumbnail__icon"
          v-html="require('!!svg-inline-loader!../../assets/link.svg')"
          :style="{ marginLeft: '10px' }"
          @click="copyLink"
        ></div>
      </div>
      <div class="thumbnail__title">{{ image.title }}</div>
      <div class="thumbnail__date">{{ image.created | date }}</div>
    </div>
  </div>
</template>

<script>
import { copyToClipboard, downloadFile, asyncTimeout } from '../../utils';

export default {
  props: ['id', 'image'],
  data() {
    return {
      saving: false,
      removing: false,
    };
  },
  filters: {
    date(value) {
      return new Date(value).toLocaleDateString();
    },
  },
  methods: {
    copyLink() {
      const { fullLink, shortLink } = this.image;
      copyToClipboard(shortLink || fullLink);
    },
    openVideo(link) {
      window.open(link, 'blank_');
    },
    async download() {
      if (!this.saving) {
        this.saving = true;
        const { imageUrl: url, url: href, created } = this.image;
        const { host } = new URL(href);
        await downloadFile({ url, filename: `${host}-${created}.png` });
      }
      this.saving = false;
    },
    async remove() {
      if (!this.removing) {
        this.removing = true;
        const { screenshoter } = chrome.extension.getBackgroundPage();
        await screenshoter.deleteImage(this.id);
        await asyncTimeout(50);
        await this.$store.dispatch('init');
      }
      this.removing = false;
    },
  },
};
</script>

<style lang="less">
.thumbnail {
  display: flex;
  width: 160px;
  height: 160px;
  justify-self: center;
  align-self: center;
  box-sizing: border-box;
  box-shadow: 0 0px 30px 0 #121212;
  border-radius: 3px;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  color: #fff;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  transition: all 0.5s;

  &_deleted {
    filter: blur(5px);
    width: 0;
    height: 0;
  }

  &:hover {
    .thumbnail__info {
      opacity: 1;
    }
  }

  &__image {
    display: flex;
    width: 100%;
    height: 100%;
    position: absolute;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }

  &__info {
    display: flex;
    width: 100%;
    height: 100%;
    background-color: #37373780;
    position: absolute;
    flex-shrink: 0;
    top: 0;
    opacity: 0;
    flex-direction: column;
    padding: 5px;
    box-sizing: border-box;
    transition: bottom 0.3s;
    line-height: 1.7;
    align-items: center;
    justify-content: center;
    transition: opacity .5s;
  }

  &__title {
    font-size: 12px;
    font-weight: 600;
    width: 100%;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: center;
  }

  &__delimeter {
    display: flex;
    height: 40px;
    border-right: 2px solid #ffffff80;
  }

  &__date {
    font-size: 10px;
    opacity: 0.8;
  }

  &__ctas {
    display: flex;
    margin-bottom: 10px;
  }

  &__icon {
    display: flex;
    width: 35px;
    height: 35px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 20px 20px;
    justify-content: center;
    align-items: center;
    border-radius: 50%;

    &:hover {
      svg {
        opacity: 1;
      }
    }

    svg {
      width: 100%;
      height: 100%;
      opacity: 0.7;
      transition: opacity .3s;
      g {
        fill: #c1494f;
      }
    }

    &_delete {
      width: 12px;
      height: 12px;
      position: absolute;
      top: 6px;
      right: 6px;
      background-color: transparent;
      z-index: 1;
    }
  }
}
</style>
