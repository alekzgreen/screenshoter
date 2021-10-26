/* eslint-disable */
const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
const asyncTimeout = async t => new Promise(r => setTimeout(() => r(true), t));
/* eslint-enable */
const copyToClipboard = (value) => {
  const input = document.createElement('input');
  document.body.appendChild(input);
  input.value = value;
  input.select();
  document.execCommand('Copy');
  document.body.removeChild(input);
};

export {
  uuidv4,
  asyncTimeout,
  copyToClipboard,
};
