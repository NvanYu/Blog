import { History, Location } from "../history";
export interface ContextValue {
  location?: Location;
  history?: History;
}

export interface match<Params = {}> {
  params: Params;
  isExact: boolean;
  path: string;
  url: string;
}

export interface RouteComponentProps<Params = {}, C = any, S = any> {
  history: History;
  location: Location<S>;
  match?: match<Params>;
}
