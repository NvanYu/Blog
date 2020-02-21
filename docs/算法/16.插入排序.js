// 适用于已经差不多有序的情况，这样效率高
// 假设前面已经有序，将后面的插入到前面有序数组中
/**
 *
 * @param {number[]} arr
 */
function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    // 判断当前位与前面有序队列中最后一位比较，如果小于，则比较，若大于，那就不用比了
    if (arr[i] < arr[i - 1]) {
      // 将第i位放到前面有序数组的正确位置上
      let temp = arr[i];
      for (let j = i; j >= 0; j--) {
        if (j > 0 && arr[j - 1] > temp) {
          arr[j] = arr[j - 1];
        } else {
          arr[j] = temp;
          break;
        }
      }
    }
  }
  console.log(`After sort: ${arr}`);
}

insertionSort([1, 3, 5, 4, 6, 7]);
