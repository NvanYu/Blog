/**
 * 反转字符串
 * Let's take LeetCode contest => s'teL ekat edoCteeL tsetnoc
 * @param {string} str
 * @return {string} 反转后的字符串
 */
function reverseString(str) {
  return str
    .split(" ")
    .map(i => {
      return i
        .split("")
        .reverse()
        .join("");
    })
    .join(" ");
}

function reverseString2(str) {
  return str
    .match(/[\w']+/g)
    .map(i => {
      return i
        .split("")
        .reverse()
        .join("");
    })
    .join(" ");
}

console.log(reverseString2("Let's take LeetCode contest"));
