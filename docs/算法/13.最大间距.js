// 给定一个无序的数组，找出数组在排序之后，相邻元素之间最大的差值。

// 如果数组元素个数小于 2，则返回 0。

// 输入: [3,6,9,1]
// 输出: 3
// 解释: 排序后的数组是 [1,3,6,9], 其中相邻元素 (3,6) 和 (6,9) 之间都存在最大差值 3。

/**
 *
 * @param {number[]} arr
 */
function maximumGap1(arr) {
  if (arr.length < 2) {
    return 0;
  }
  arr.sort((a, b) => a - b);
  let max = 0;
  for (let i = 0, len = arr.length - 1, tmp; i < len; i++) {
    tmp = arr[i + 1] - arr[i];
    if (tmp > max) {
      max = tmp;
    }
  }
  return max;
}

function swap(arr, i1, i2) {
  var temp = arr[i1];
  arr[i1] = arr[i2];
  arr[i2] = temp;
}

/**
 *
 * @param {number[]} arr
 */
function maximumGap2(arr) {
  if (arr.length < 2) {
    return 0;
  }
  let space = 0;
  let max = 0;
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
      }
    }
    if (i >= 1) {
      space = arr[arr.length - i] - arr[arr.length - i - 1];
      if (space > max) {
        max = space;
      }
    }
  }
  return Math.max(max, arr[1] - arr[0]);
}

console.log(maximumGap2([10, 6, 12, 1, 18]));
