import {
  StoreCreator,
  Action,
  Reducer,
  Store,
  Dispatch,
  Listener,
  Subscribe,
  Unsubscribe
} from "./";
const createStore: StoreCreator = <S, A extends Action<any>, Ext, StateExt>(
  reducer: Reducer<S, A>,
  preloadedState?: S | undefined
): Store<S, A> => {
  let currentState: S | undefined = preloadedState;
  let currentListener = [];

  function getState(): S | undefined {
    return currentState;
  }

  const dispatch: Dispatch<A> = (action: A): A => {
    currentState = reducer(currentState, action);
    currentListener.forEach(l => l());
    return action;
  };

  const subscribe: Subscribe = (listener: Listener): Unsubscribe => {
    currentListener.push(listener);
    return function() {
      let index: number = currentListener.indexOf(listener);
      currentListener.splice(index, 1);
    };
  };

  const store: Store<S, A> = {
    getState,
    dispatch,
    subscribe
  };
  return store;
};

export default createStore;
