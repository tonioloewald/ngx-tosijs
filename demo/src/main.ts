import "@angular/compiler"; // JIT — no Angular CLI in this build
import "tosijs-ui";
import "./state";
import { bootstrapApplication } from "@angular/platform-browser";
import { provideZonelessChangeDetection } from "@angular/core";
import { AppComponent } from "./app";
import { mountReactIsland } from "./react-island";

bootstrapApplication(AppComponent, {
  providers: [provideZonelessChangeDetection()],
}).then(() => {
  mountReactIsland(document.getElementById("react-island"));
});
