import { LoginComponent } from "./pages/login/login.component";
import { MapPageComponent } from "./pages/map-page/map-page.component";
import {ListComponent} from "./pages/list/list.component";

export const routes = [
  { path: "", component: LoginComponent },
  { path: "map-page", component: MapPageComponent },
  { path: "prize-list", component: ListComponent }
];

export const navigatableComponents = [
  LoginComponent,
  MapPageComponent,
  ListComponent
];
