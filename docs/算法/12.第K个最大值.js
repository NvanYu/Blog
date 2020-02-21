// 在未排序的数组中找到第 k 个最大的元素。请注意，你需要找的是数组排序后的第 k 个最大的元素，而不是第 k 个不同的元素。

// 输入: [3,2,1,5,6,4] 和 k = 2
// 输出: 5

let firstMaxK = (arr, k) => arr.sort((a, b) => b - a)[k - 1];

console.log("简单方法:" + firstMaxK([3, 2, 1, 5, 6, 4], 2));

/**
 *
 * @param {array} arr
 * @param {number} k
 */
function maxK(arr, k) {
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
      }
    }
  }
  return arr[arr.length - k];
}

function swap(arr, i1, i2) {
  var temp = arr[i1];
  arr[i1] = arr[i2];
  arr[i2] = temp;
}

console.log("骚操作:" + maxK([3, 2, 1, 5, 6, 4], 2));
