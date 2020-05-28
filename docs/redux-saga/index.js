let EventEmitter = require("event");

export default function createSagaMiddleware() {
  let events = new EventEmitter();
  function sagaMiddleware({ getState, dispatch }) {
    function run(generator) {
      let it = generator();
      function next(action) {
        let { value: effect, done } = it.next(action);
        if (!done) {
          if (typeof effect[Symbol.iterator] === "function") {
            run(effect);
            next();
          } else {
            switch (effect.type) {
              case "TAKE":
                events.once(effect.actionType, next);
                break;
              case "PUT":
                dispatch(effect.action);
                next();
              case "CALL":
                let { fn, args, context } = effect.payload;
                fn.apply(context, args).then(next);
              default:
                break;
            }
          }
        }
      }
      next();
    }
    sagaMiddleware.run = run;
    return function(next) {
      return function(action) {
        events.emit(action.actionType, action);
        return next(action);
      };
    };
  }
  return sagaMiddleware;
}
