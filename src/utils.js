'use strict';

function peek(queue){
  if (queue.first) {
    return queue.first.value;
  }
  return null;
}

function isEmpty(queue){
  return (queue.first===null);
}

function display(queue) {
  if (isEmpty(queue)) return;
  let tempTop = queue.first;
  while (tempTop) {
    tempTop = tempTop.next;
  }
}

module.exports = {
  peek,
  isEmpty,
  display
};
