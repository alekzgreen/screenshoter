<template>
  <div class="thumbnail" @click="download">
    <div class="thumbnail__image" :style="{backgroundImage: `url(${image.imageUrl})`}"></div>
    <div
      class="thumbnail__image thumbnail__image_download"
      v-html="require('!!svg-inline-loader!../../assets/download.svg')"
    ></div>
    <div
      class="thumbnail__icon thumbnail__icon_delete"
      v-html="require('!!svg-inline-loader!../../assets/delete.svg')"
      @click.stop="remove"
    ></div>
    <div class="thumbnail__info">
      <div class="thumbnail__title">{{ image.title }}</div>
      <div class="thumbnail__date">{{ image.created }}</div>
    </div>
    <!-- <div class="thumbnail__ctas" @click.stop>
          <div
          class="thumbnail__icon"
          title="Click to copy!"
          @click.stop="copyLink(video.shortUrl || video.fullUrl)"
          v-html="require('!!svg-inline-loader!../../assets/link.svg')"></div>
        </div>
        <div class="thumbnail__info">
          <div class="thumbnail__title">{{ video.title }}</div>
          <div class="thumbnail__date">{{ video.timeCreated | date }}</div>
    </div>-->
  </div>
</template>

<script>
import { copyToClipboard, downloadFile } from '../../utils';

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
    copyLink(link) {
      copyToClipboard(link);
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
      }
      this.removing = false;
    },
  },
};
</script>

<style lang="less">
.content {
  display: grid;
  grid-template-columns: repeat(auto-fill, 150px);
  grid-template-rows: auto;
  grid-column-gap: 25px;
  grid-row-gap: 25px;
  margin-top: 60px;
  width: 100%;
  box-sizing: border-box;
  padding: 50px;
  overflow: hidden;
  overflow-y: auto;
  justify-content: center;

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: #fff;
    grid-area: header;
  }
}

.thumbnail {
  display: flex;
  width: 150px;
  height: 150px;
  justify-self: center;
  box-sizing: border-box;
  box-shadow: 0 0px 30px 0 #363635;
  border-radius: 3px;
  border: 3px solid #fff;
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
    width: 20px;
    height: 20px;
  }

  &:hover {
    border: 3px solid #f9d383;

    .thumbnail__info {
      bottom: 0;
    }

    .thumbnail__image {
      filter: grayscale(0);
      &_download {
        opacity: 1;
      }
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
    transition: filter 0.3s;
    filter: grayscale(0.7);

    &:hover {
      filter: grayscale(0);
    }

    &_download {
      opacity: 0;
      transition: opacity 0.3s;
      align-items: center;
      justify-content: center;
      svg {
        width: 35%;
        height: 35%;
        g {
          fill: #f9d383;
        }
      }
    }
  }

  &__info {
    display: flex;
    width: 100%;
    background-color: #37373780;
    position: absolute;
    flex-shrink: 0;
    bottom: -50px;
    flex-direction: column;
    padding: 5px;
    box-sizing: border-box;
    justify-content: space-between;
    transition: bottom 0.3s;
  }

  &__title {
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &__date {
    font-size: 10px;
    opacity: 0.8;
  }

  &__ctas {
    display: flex;
    position: absolute;
    right: 10px;
    top: 10px;
  }

  &__icon {
    display: flex;
    width: 30px;
    height: 30px;
    background-repeat: no-repeat;
    background-position: center;
    background-size: 20px 20px;
    justify-content: center;
    align-items: center;
    background-color: #1f1f1f;
    border-radius: 50%;

    svg {
      width: 60%;
      height: 60%;
    }

    &_delete {
      width: 20px;
      height: 20px;
      position: absolute;
      top: 5px;
      right: 5px;
      background-color: transparent;
      opacity: 0.5;
      transition: opacity 0.3s;

      &:hover {
        opacity: 1;
      }

      svg {
        width: 100%;
        height: 100%;
        g {
          fill: #ee7766;
        }
      }
    }
  }
}
</style>