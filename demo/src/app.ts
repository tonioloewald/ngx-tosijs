import { Component, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { tosiSignal } from "ngx-tosijs";
import { app, Reminder } from "./state";

@Component({
  selector: "app-root",
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="column">
      <div class="parallax sky"></div>
      <div class="parallax far"></div>
      <div class="parallax medium"></div>
      <div class="parallax near"></div>
      <tosi-lottie
        style="width: 300px; height: 300px; margin-bottom: -65px; z-index: 1"
        src="/tosi.json"
      ></tosi-lottie>
      <div class="apps">
        <div class="App">
          <h2>{{ name() }} <span class="framework-tag">Angular</span></h2>
          <div class="List">
            @for (item of todos(); track item.id) {
              <div class="ListItem">
                <span class="elastic">{{ item.reminder }}</span>
                <button title="delete" (click)="remove(item)">&times;</button>
              </div>
            }
          </div>
          <form class="Editor" (submit)="addItem($event)">
            <input
              class="elastic"
              placeholder="enter a reminder"
              [value]="reminder()"
              (input)="onInput($event)"
            />
            <button [disabled]="!reminder()">Add Item #{{ nextId() }}</button>
          </form>
        </div>
        <div id="react-island"></div>
      </div>
      <tosi-md class="doc" src="/ngx-tosi.md"></tosi-md>
    </div>
  `,
})
export class AppComponent {
  name = tosiSignal<string>("app.name");
  reminder = tosiSignal<string>("app.newItem.reminder");
  nextId = tosiSignal<number>("app.newItem.id");
  todos = tosiSignal<Reminder[]>("app.todos");

  onInput(event: Event) {
    this.reminder.set((event.target as HTMLInputElement).value);
  }

  addItem(event: Event) {
    app.addItem(event);
  }

  remove(item: Reminder) {
    const todos = app.todos;
    // cast is the proxy-identity typing gap — retire when tosijs#17 closes
    todos.splice(todos.indexOf(item as any), 1);
  }
}
