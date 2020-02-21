/**
 * 给定一个仅包含数字 2-9 的字符串，返回所有它能表示的字母组合。
 * 给出数字到字母的映射如下（与电话按键相同）。注意 1 不对应任何字母。
 * @param {string} digits
 */
function letterCombinations(digits) {
  let map = ["", 1, "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"];
  let num = digits.split(""); // ['2', '3']
  let code = [];
  num.forEach(item => {
    if (map[item]) {
      code.push(map[item]); // ['abc', 'def']
    }
  });
  let res = compose(code);
  console.log(res);
}

/**
 * 组合
 * @param {array} arr
 */
function compose(arr) {
  let tmp = []; // 临时变量存储数组前2个元素组合的值
  for (let i = 0, il = arr[0].length; i < il; i++) {
    for (let j = 0, jl = arr[1].length; j < jl; j++) {
      tmp.push(`${arr[0][i]}${arr[1][j]}`);
    }
  }
  arr.splice(0, 2, tmp);
  if (arr.length > 1) {
    compose(arr);
  } else {
    return tmp;
  }
  return arr[0];
}

letterCombinations("2345");
