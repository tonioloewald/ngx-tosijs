import { xinProxy } from "tosijs";

export type Reminder = {
  id: number;
  reminder: string;
};

declare global {
  var app: any;
}

// ONE state model. The Angular app, the React island, and the browser
// console all bind to these same paths — that's the whole point.
export const { app } = xinProxy({
  app: {
    name: "Reminders",
    newItem: {
      id: 1,
      reminder: "",
    } as Reminder,
    todos: [] as Reminder[],
    addItem(evt: Event) {
      evt.preventDefault();
      if (!app.newItem.reminder) return;
      app.todos.push({
        ...app.newItem,
      });
      app.newItem.id++;
      app.newItem.reminder = "";
    },
  },
});

globalThis.app = app;
