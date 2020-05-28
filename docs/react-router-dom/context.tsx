import { createContext } from "react";
import { ContextValue } from "./types";
let RouterContext = createContext<ContextValue>({});
export default RouterContext;
