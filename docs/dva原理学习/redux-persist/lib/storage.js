/**
* storage: 存储引擎，让我们指定如何存储状态数据，默认是localStorage
*/
export default {
  setItem(key, value) {
    localStorage.setItem(key, value);
  },
  getItem(key) {
    return localStorage.getItem(key);
  }
};
