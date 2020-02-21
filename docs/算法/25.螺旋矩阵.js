// 给定一个包含 m x n 个元素的矩阵（m 行, n 列），请按照顺时针螺旋顺序，返回矩阵中的所有元素。

// 输入:
// [
//  [ 1, 2, 3 ],
//  [ 4, 5, 6 ],
//  [ 7, 8, 9 ]
// ]
// 输出: [1,2,3,6,9,8,7,4,5]

/**
 * @param {number[][]} arr
 * @return {number[]}
 */
var spiralOrder = function(arr) {
  // 处理每一圈的数据遍历过程
  let map = (arr, r = []) => {
    for (let i = 0, len = arr.length; i < len; i++) {
      if (i === 0) {
        r = r.concat(arr[i]);
      } else if (i === len - 1) {
        r = r.concat(arr[i].reverse());
      } else {
        r.push(arr[i].pop());
      }
    }
    arr.shift();
    arr.pop();
    for (let i = arr.length - 1; i >= 0; i--) {
      r.push(arr[i].shift());
    }
    if (arr.length) {
      return map(arr, r);
    } else {
      return r;
    }
  };
  return map(arr, []);
};

console.log(
  spiralOrder([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ])
);
