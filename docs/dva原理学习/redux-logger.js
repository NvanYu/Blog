const colors = {
  prevState: "#9e9e9e",
  action: "#03a9f4",
  nextState: "#4caf50"
};

const logger = ({ dispatch, getState }) => next => action => {
  let prevState = getState();
  next(action);
  let nextState = getState();

  console.group(
    `%caction %c${action.type} %c@${new Date().toLocaleTimeString}`,
    `color:gray;font-weight:lighter`,
    `color:inherit;font-weight:bolder`,
    `color:gray;font-weight:lighter`
  );
  console.log(
    "%cprev state",
    `color: ${colors.prevState};font-weight:lighter`,
    prevState
  );
  console.log(
    "%caction",
    `color: ${colors.action};font-weight:lighter`,
    action
  );
  console.log(
    "%cnext state",
    `color: ${colors.nextState};font-weight:lighter`,
    nextState
  );
  console.groupEnd();
};

export default logger;
