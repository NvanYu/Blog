export default function bindActionCreators(actions: any, dispatch: any) {
  let boundActionsCreators: Record<string, any> = {};
  for (const key in actions) {
    const actionCreator = actions[key];
    if (typeof actionCreator === "function") {
      boundActionsCreators[key] = bindActionCreator(actionCreator, dispatch);
    }
  }
  return boundActionsCreators;
}

function bindActionCreator(actionCreator: any, dispatch: any) {
  return function(this: any, ...args: Array<any>) {
    return dispatch(actionCreator.apply(this.args));
  };
}
