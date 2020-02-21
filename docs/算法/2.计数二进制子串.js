/**
 * 给定一个字符串 s，计算具有相同数量0和1的非空(连续)子字符串的数量，
 * 且这些子字符串中的所有0和所有1都是组合在一起的。
 * 重复出现的子串要计算它们出现的次数
 * @param {string} str
 * @return {number} 次数
 */
function countBinarySubstrings(str) {
  let result = [];
  let loopCount = str.length - 1;
  for (let i = 0; i < loopCount; i++) {
    let matchedStr = searchStr(str.slice(i));
    if (matchedStr) {
      result.push(matchedStr);
    }
  }
  return { result, length: result.length };
}

function searchStr(str) {
  let sub = str.match(/^(0+|1+)/)[0];
  let sameSub = (sub[0] ^ 1).toString().repeat(sub.length);
  let reg = new RegExp(`^(${sub}${sameSub})`);
  if (reg.test(str)) {
    return RegExp.$1;
  }
  return "";
}

console.log(countBinarySubstrings("10101010"));
