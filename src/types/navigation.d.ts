import { ReactComponentElement } from "react";

export interface IRoute {
  path: string;
  name: string;
  icon?: JSX.Element;
  component: React.ComponentType;
  layout: string;
  userType?: string | string[];
}
