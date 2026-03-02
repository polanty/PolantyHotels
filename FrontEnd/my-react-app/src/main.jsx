import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux"; // from React redux
import { store } from "./store/index.js";

import "./index.css";
import "mapbox-gl/dist/mapbox-gl.css";

import App from "./App.jsx";
import Index from "./Pages/Index/Index.Page.jsx";
import AuthPage from "./Pages/Auth/Auth.page.jsx";
import HotelSearchResults from "./Pages/Search/Search.page.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Index /> },
      { path: "auth", element: <AuthPage /> },
      { path: "search", element: <HotelSearchResults /> },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
);
