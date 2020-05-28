import compose from "./compose";
export default function applyMiddleware(...middlewares: any[]) {
  return function(createStore: any) {
    // store enhancer
    return function(reducer) {
      let store = createStore(reducer);
      // 在这实现新的dispatch替换老的store.dispatch
      let dispatch: any = undefined;
      const middlewareAPI = {
        getState: store.getState,
        dispatch: (action: any) => dispatch(action)
      };
      const chain = middlewares.map((middleware: any) =>
        middleware(middlewareAPI)
      );
      // compose(...middlewares)=(next) => logger1(logger2(next));
      dispatch = compose(...chain)(store.dispatch);
      return {
        ...store,
        dispatch
      };
    };
  };
}
