const formats = {
  mp4: {
    title: 'MPEG-4',
    recorderType: 'video/webm;codecs=h264',
    blobType: 'video/mp4',
  },
  webm: {
    title: 'WebM',
    recorderType: 'video/webm;codecs=h264,vp9,opus',
    blobType: 'video/webm;codecs=h264',
  },
};

const qualities = {
  normal: {
    title: 'Normal',
    videoBitsPerSecond: 2000000,
  },
  high: {
    title: 'High',
    videoBitsPerSecond: 3000000,
  },
  best: {
    title: 'Best',
    videoBitsPerSecond: 5000000,
  },
};

const shortenerApi = 'https://api.rebrandly.com/v1/links';
const shortenerKey = 'dc24e5f7305046fc91486501d284d622';

const supporters = [{
  name: 'Eldar Traistor',
  logo: 'https://scontent-lax3-1.xx.fbcdn.net/v/t1.0-1/p160x160/28058621_2069193563316995_2580290494859250310_n.jpg?_nc_cat=106&_nc_ht=scontent-lax3-1.xx&oh=88ea2542e9ea74aff440f67f182db615&oe=5D1B2B86',
  link: 'https://www.facebook.com/e.traistor',
}, {
  name: 'Aleksandr Kamardin',
  logo: 'https://pp.userapi.com/c850332/v850332913/9ee3f/VAdk0svTtmk.jpg?ava=1',
  link: 'https://vk.com/alekskam',
}, {
  name: 'Alexander Bogovich',
  link: 'https://www.facebook.com/alexander.bogovich.98',
}, {
  name: 'Michael Swagowsky',
  logo: 'https://pp.userapi.com/c852236/v852236940/5f75d/ljZBna_DYmE.jpg?ava=1',
  link: 'https://vk.com/wicked_nastya',
}];

export {
  formats,
  qualities,
  shortenerApi,
  shortenerKey,
  supporters,
};
