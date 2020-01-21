/*
* persistStore: 持久化仓库，对仓库的增强，给store加了一些方法，可以实现持久化
* persistReducer: 增强我们的reducer的，添加了持久化
*/
import persistStore from "./persistStore";
import persistReducer from "./persistReducer";

export { persistStore, persistReducer };
