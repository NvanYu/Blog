// 给定一个非空的字符串，判断它是否可以由它的一个子串重复多次构成。
// 给定的字符串只含有小写英文字母，并且长度不超过10000。

// 输入: "abab"

// 输出: True

// 解释: 可由子字符串 "ab" 重复两次构成。

/**
 *
 * @param {string} s
 */
function repeatedSubstringPattern(s) {
  return /^(\w+)\1+$/.test(s);
}
console.log(repeatedSubstringPattern("abab"));
