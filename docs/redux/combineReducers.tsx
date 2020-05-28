export default function combineReducers(reducers: any) {
  // state是合并后的总状态
  return function(state: any = {}, action: any) {
    const nextState = {};
    for (let key in reducers) {
      let reducer = reducers[key];
      let previousStateForKey = state[key]; // key是count1的老状态{number:0}
      let nextStateForKey = reducer(previousStateForKey, action);
      nextState[key] = nextStateForKey;
    }
    return nextState;
  };
}
