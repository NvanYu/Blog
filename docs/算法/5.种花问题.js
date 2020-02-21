// 给定一个花坛（表示为一个数组包含0和1，其中0表示没种植花，1表示种植了花），和一个数 n 。
// 能否在不打破种植规则的情况下种入 n 朵花？能则返回True，不能则返回False。
// 输入: flowerbed = [1,0,0,0,1], n = 1
// 输出: True

/**
 *
 * @param {number[]} arr
 * @param {number} n
 */
function canPlaceFlowers(arr, n) {
  let count = 0;
  for (let i = 0, len = arr.length - 1; i < len; i++) {
    if (arr[i] === 0) {
      if (i === 0 && arr[i + 1] === 0) {
        count++;
        i++;
      } else if (arr[i - 1] === 0 && arr[i + 1] === 0) {
        count++;
        i++;
      }
    }
  }
  return count >= n;
}

console.log(canPlaceFlowers([1, 0, 0, 0, 1], 2));
