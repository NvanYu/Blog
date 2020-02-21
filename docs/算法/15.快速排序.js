let quickSort = function(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  let flag = arr[0];
  let left = [];
  let right = [];
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] < flag) {
      left.push(arr[i]);
    } else {
      right.push(arr[i]);
    }
  }
  return quickSort(left).concat(flag, quickSort(right));
};
console.log(quickSort([3, 2, 1, 5, 6, 4]));

function quickSorting(arr) {
  // 对某一个区域进行快排，start为起始位置，end为结束位置
  function _quickSort(arr, start, end) {
    if (start > arr.length - 1 || start >= end) return;
    // 选取基准值
    let key = arr[end];
    let low = start;
    let high = end;
    while (low < high) {
      while (low < high && arr[low] < key) low++;
      arr[high] = arr[low];
      while (low < high && arr[high] > key) high--;
      arr[low] = arr[high];
    }
    arr[low] = key;
    _quickSort(arr, start, low - 1);
    _quickSort(arr, low + 1, end);
  }
  _quickSort(arr, 0, arr.length - 1);
}
let arr = [3, 2, 1, 5, 6, 4];
quickSorting(arr);
console.log(arr);
