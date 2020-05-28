export function take(actionType) {
  return {
    type: "TAKE",
    actionType
  };
}

export function put(action) {
  return {
    type: "PUT",
    action
  };
}

export function call(fn, ...args) {
  let context = null;
  if (Array.isArray(fn)) {
    fn = fn[1];
    context = fn[0];
  }
  return {
    type: "CALL",
    payload: { fn, context, args: args }
  };
}

export function delay(...args) {
  return {
    type: "CALL",
    payload: { fn: delayP, args: args }
  };
}

function delayP(ms, val) {
  return new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(val);
    }, ms);
  });
}
