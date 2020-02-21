let arr = [5, -2, 4, "C", "D", 9, "+", "+"];

let stack = [];
let count = 0;

for (let i = 0; i < arr.length; i++) {
  if (typeof arr[i] === "number") {
    stack.push(arr[i]);
  } else if (typeof arr[i] === "string" && arr[i] === "C") {
    stack.pop();
  } else if (typeof arr[i] === "string" && arr[i] === "D") {
    let num = stack[stack.length - 1];
    stack.push(num * 2);
  } else if (typeof arr[i] === "string" && arr[i] === "+") {
    let num1 = stack[stack.length - 1];
    let num2 = stack[stack.length - 2];
    stack.push(num1 + num2);
  }
}

count = stack.reduce((pre, cur) => {
  return pre + cur;
}, 0);

console.log(count);
