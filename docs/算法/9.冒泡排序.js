function bubbleSort(arr) {
  for (var i = 0; i < arr.length - 1; i++) {
    //需要经过arr.length-1次的冒泡
    //i:0   循环：0~arr.length-1-i
    //i:1   循环：0~arr.length-1-i
    //i:2   循环: 0~arr.length-1-i
    for (var j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        swap(arr, j, j + 1);
      }
    }
  }
}

function swap(arr, i1, i2) {
  var temp = arr[i1];
  arr[i1] = arr[i2];
  arr[i2] = temp;
}

bubbleSort([3, 2, 1, 5, 6, 4]);
