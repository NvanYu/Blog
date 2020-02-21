// 给定一个只包含数字的字符串，复原它并返回所有可能的 IP 地址格式

// 输入: "25525511135"
// 输出: ["255.255.11.135", "255.255.111.35"]

/**
 *
 * @param {string} s
 */
function restoreIpAddresses(s) {
  let ret = [];
  let search = (cur, sub) => {
    if (cur.length === 4 && cur.join("") === s) {
      ret.push(cur.join("."));
    } else {
      for (let i = 0, len = Math.min(3, sub.length), tmp; i < len; i++) {
        tmp = sub.substr(0, i + 1);
        if (tmp < 256) {
          search(cur.concat(tmp), sub.substr(i + 1));
        }
      }
    }
  };
  search([], s);
  return ret;
}

console.log(restoreIpAddresses("25525511135"));
