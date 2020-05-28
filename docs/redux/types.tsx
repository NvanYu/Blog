export interface Action<T = any> {
  type: T;
}

export interface AnyAction extends Action {
  [extraProps: string]: any;
}

// export interface Reducer<S = any, A extends Action = AnyAction> {
//   (state: S | undefined,action: A): S
// }

export type Reducer<S = any, A extends Action = AnyAction> = (
  state: S | undefined,
  action: A
) => S;

export type Dispatch<A extends Action = AnyAction> = (action: A) => A;

export type Listener = () => void;

export type Subscribe = (listener: Listener) => Unsubscribe;

export type Unsubscribe = () => void;

export interface Store<S = any, A extends Action = AnyAction> {
  dispatch: Dispatch<A>;
  getState(): S;
  subscribe(listener: Listener): Unsubscribe;
}

export type StoreCreator = <S, A extends Action<any>, Ext, StateExt>(
  reducer: Reducer<S, A>,
  preloadedState?: S
) => Store<S, A>;

// export interface StoreCreator {
//   <S, A extends Action<any>, Ext, StateExt>(
//     reducer: Reducer<S, A>,
//     preloadedState?: S
//   ): Store<S, A>;
// }
