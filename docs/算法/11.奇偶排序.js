// 给定一个非负整数数组 A，返回一个数组，在该数组中，
// A 的所有偶数元素之后跟着所有奇数元素。

// 你可以返回满足此条件的任何数组作为答案。

// 输入：[3,1,2,4]
// 输出：[2,4,3,1]
// 输出 [4,2,3,1]，[2,4,1,3] 和 [4,2,1,3] 也会被接受。

/**
 *
 * @param {array} arr
 */
function sortArrayByParity(arr) {
  // 排序
  arr = arr.sort((a, b) => a - b);
  // 最终结果
  let ret = [];
  // 记录奇数位下标
  let odd = 1;
  // 记录偶数位下标
  let even = 0;
  arr.forEach(v => {
    if (v % 2 === 1) {
      ret[odd] = v;
      odd += 2;
    } else {
      ret[even] = v;
      even += 2;
    }
  });
  return ret;
}

console.log(sortArrayByParity([3, 1, 2, 4]));
