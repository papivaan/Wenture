import { LoginComponent } from "./pages/login/login.component";
import { MapPageComponent } from "./pages/map-page/map-page.component";

export const routes = [
  { path: "", component: LoginComponent },
  { path: "map-page", component: MapPageComponent }
];

export const navigatableComponents = [
  LoginComponent,
  MapPageComponent
];
