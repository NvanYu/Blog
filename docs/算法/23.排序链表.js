// 在 O(n log n) 时间复杂度和常数级空间复杂度下，对链表进行排序。

// 示例 1:

// 输入: 4->2->1->3
// 输出: 1->2->3->4
// 示例 2:

// 输入: -1->5->3->4->0
// 输出: -1->0->3->4->5

class Node {
  constructor(value) {
    this.val = value;
    this.next = null;
  }
}

class NodeList {
  constructor(arr) {
    // 声明头结点
    let head = new Node(arr.shift());
    let next = head;
    arr.forEach(item => {
      next.next = new Node(item);
      next = next.next;
    });
    return head;
  }
}

let wrap = (p, q) => {
  let val = p.val;
  p.val = q.val;
  q.val = val;
};
