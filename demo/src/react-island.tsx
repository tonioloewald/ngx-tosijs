/**
 * The React island: the SAME Reminders app, in React, bound to the SAME
 * tosijs paths as the Angular version beside it. Neither framework knows
 * the other exists; tosijs is the only thing they share.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { useTosi } from "react-tosijs";
import { app, Reminder } from "./state";

const List = () => {
  const [todos] = useTosi<Reminder[]>("app.todos");
  return (
    <div className="List">
      {todos.map((item) => (
        <div className="ListItem" key={item.id}>
          <span className="elastic">{item.reminder}</span>
          <button
            title="delete"
            onClick={() => {
              todos.splice(todos.indexOf(item), 1);
            }}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

const Editor = () => {
  const [reminder, setReminder] = useTosi<string>("app.newItem.reminder");
  const [id] = useTosi<number>("app.newItem.id");
  return (
    <form
      className="Editor"
      onSubmit={(event) => app.addItem(event.nativeEvent)}
    >
      <input
        className="elastic"
        placeholder="enter a reminder"
        value={reminder}
        onInput={(event) =>
          setReminder((event.target as HTMLInputElement).value)
        }
      />
      <button disabled={!reminder}>Add Item #{id}</button>
    </form>
  );
};

const ReactReminders = () => {
  const [name] = useTosi<string>("app.name");
  return (
    <div className="App">
      <h2>
        {name} <span className="framework-tag">React</span>
      </h2>
      <List />
      <Editor />
    </div>
  );
};

export const mountReactIsland = (element: Element | null) => {
  if (!element) return;
  ReactDOM.createRoot(element).render(<ReactReminders />);
};
