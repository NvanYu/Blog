// 给定一个 n × n 的二维矩阵表示一个图像。

// 将图像顺时针旋转 90 度。

// 说明：

// 你必须在原地旋转图像，这意味着你需要直接修改输入的二维矩阵。请不要使用另一个矩阵来旋转图像。

// 给定 matrix =
// [
//   [1,2,3],
//   [4,5,6],
//   [7,8,9]
// ],

// 原地旋转输入矩阵，使其变为:
// [
//   [7,4,1],
//   [8,5,2],
//   [9,6,3]
// ]

/**
 * @param {number[][]} arr
 * @return {void} Do not return anything, modify matrix in-place instead.
 */
var rotate = function(arr) {
  // 获取n的维度
  let vector = arr.length;

  let tmp = 0;
  // 垂直翻转
  for (let i = 0; i < vector / 2; i++) {
    for (let j = 0; j < vector; j++) {
      tmp = arr[i][j];
      arr[i][j] = arr[vector - i - 1][j];
      arr[vector - i - 1][j] = tmp;
    }
  }

  // 对角线翻转
  for (let i = 0; i < vector; i++) {
    for (let j = 0; j < i; j++) {
      tmp = arr[i][j];
      arr[i][j] = arr[j][i];
      arr[j][i] = tmp;
    }
  }
  return arr;
};

console.log(
  rotate([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
  ])
);
