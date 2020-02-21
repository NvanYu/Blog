// 给定一个未排序的整数数组，找出其中没有出现的最小的正整数。

// 输入: [1,2,0]
// 输出: 3

// 输入: [3,4,-1,1]
// 输出: 2

// 输入: [7,8,9,11,12]
// 输出: 1

/**
 *
 * @param {number[]} arr
 */
function firstMissingPositive(arr) {
  arr = arr.filter(v => v > 0);
  if (arr.length) {
    arr.sort((a, b) => a - b);
    if (arr[0] !== 1) {
      return 1;
    } else {
      for (let i = 0, len = arr.length - 1; i < len; i++) {
        if (arr[i + 1] - arr[i] > 1) {
          return arr[i] + 1;
        }
      }
      return arr.pop() + 1;
    }
  } else {
    return 1;
  }
}

/**
 *
 * @param {number[]} arr
 */
function firstMissingPositive2(arr) {
  arr = arr.filter(v => v > 0);
  for (let i = 0; i < arr.length - 1; i++) {
    let min = arr[i]; //定义一个变量，为该区间的第一个数
    let index = i; //最小值所在的位置
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < min) {
        min = arr[j];
        index = j;
      }
    }
    swap(arr, i, index);
    if (i > 0) {
      if (arr[i] - arr[i - 1] > 1) {
        return arr[i - 1] + 1;
      }
    } else {
      if (min !== 1) {
        return 1;
      }
    }
  }
  return arr.length ? arr.pop() + 1 : 1;
}

function swap(arr, i1, i2) {
  var temp = arr[i1];
  arr[i1] = arr[i2];
  arr[i2] = temp;
}

console.log(firstMissingPositive2([1, 2, 0]));
