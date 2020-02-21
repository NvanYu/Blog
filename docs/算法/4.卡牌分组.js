// 给定一副牌，每张牌上都写着一个整数。
// 此时，你需要选定一个数字 X，使我们可以将整副牌按下述规则分成 1 组或更多组：
// 每组都有 X 张牌。
// 组内所有的牌上都写着相同的整数
// 输入：[1,2,3,4,4,3,2,1]
// 输出：true
// 解释：可行的分组是[1, 1]，[2, 2]，[3, 3]，[4, 4]

/**
 * 求2个数的最大公约数
 * @param {number} a
 * @param {number} b
 */
function gcd(a, b) {
  if (b === 0) {
    return a;
  } else {
    return gcd(b, a % b);
  }
}

/**
 *
 * @param {number[]} arr
 */
function hasGroupsSizeX(arr) {
  // 排序，为了把相同的牌放在一起便于分组
  let deck = arr.sort().join("");
  // 分组
  let group = deck.match(/(\d)\1+|\d/g);
  while (group.length > 1) {
    let a = group.shift().length;
    let b = group.shift().length;
    let v = gcd(a, b);
    if (v === 1) {
      return false;
    } else {
      group.unshift("0".repeat(v));
    }
  }
  // 处理边界
  return group.length ? group[0].length > 1 : false;
}

console.log(hasGroupsSizeX([1, 1]));
