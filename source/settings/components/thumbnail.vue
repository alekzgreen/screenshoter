<template>
  <div
    :class="['thumbnail', removing && 'thumbnail_deleted']">
    <div
      :class="['thumbnail__image', !image.thumbnail && 'thumbnail__image_empty']"
      :style="{ backgroundImage: `url(${image.thumbnail})` }"></div>
    <div
      class="thumbnail__icon thumbnail__icon_delete"
      v-html="require('!!svg-inline-loader!../../assets/close.svg')"
      @click.stop="remove"
    ></div>
    <div class="thumbnail__info">
      <div>
        <div class="thumbnail__title">{{ image.title }}</div>
        <div class="thumbnail__date">{{ image.created | date }}</div>
      </div>
      <div class="thumbnail__ctas">
        <CTA
          title="Download image"
          :style="{ marginRight: '10px' }"
          @click.native="download"
          v-html="require('!!svg-inline-loader!../../assets/download.svg')" />
        <CTA
          title="Copy shortlink"
          @click.native="copyLink"
          v-html="require('!!svg-inline-loader!../../assets/link.svg')" />
      </div>
    </div>
  </div>
</template>

<script>
import { copyToClipboard, downloadFile, asyncTimeout } from '../../utils';
import CTA from './cta.vue';

export default {
  components: {
    CTA,
  },
  props: ['image'],
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
        await screenshoter.deleteImage(this.image.id);
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
  width: 290px;
  height: 220px;
  justify-self: center;
  align-self: center;
  box-sizing: border-box;
  border-radius: 8px;
  flex-shrink: 0;
  position: relative;
  color: #fff;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;

  &_deleted {
    filter: blur(5px);
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
    &_empty {
      background-size: 30%;
      background-color: #333;
      background-image: url('../../assets/picture.svg') !important;
    }
  }

  &__info {
    display: flex;
    width: 100%;
    height: 60px;
    background-color: #0f0a0a80;
    position: absolute;
    flex-shrink: 0;
    bottom: 0;
    opacity: 0;
    padding: 0 15px;
    box-sizing: border-box;
    transition: bottom 0.3s;
    line-height: 1.7;
    align-items: center;
    justify-content: space-between;
    transition: opacity .3s;
    cursor: default;
  }

  &__title {
    font-size: 12px;
    font-weight: 600;
    width: 150px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    text-align: left;
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
    cursor: pointer;

    &_delete {
      width: 15px;
      height: 15px;
      position: absolute;
      top: 10px;
      right: 15px;
      background-color: transparent;
      z-index: 1;

      svg {
        fill: #c1494f;
      }
    }
  }
}
</style>
