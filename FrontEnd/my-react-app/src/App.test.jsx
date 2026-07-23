import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import App from "./App";

test("shows the loading state while the session is bootstrapping", () => {
  const store = {
    getState: () => ({ auth: { bootstrapped: false } }),
    subscribe: () => () => {},
    dispatch: vi.fn(),
  };

  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );

  expect(screen.getByText("Loading...")).toBeInTheDocument();
  expect(store.dispatch).toHaveBeenCalled();
});
