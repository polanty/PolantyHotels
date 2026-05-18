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
import HotelDetailsPage from "./Pages/Hotel/Hotel.jsx";
import RouteErrorPage from "./Pages/GlobalError/RouteErrorPage.jsx";

//payment sucess routes
import PaymentSuccess from "./Pages/PaymentSucess/PaymentSucess.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <Index /> },
      { path: "auth", element: <AuthPage /> },
      { path: "search", element: <HotelSearchResults /> },
      { path: "/hotels/:hotelId", element: <HotelDetailsPage /> },
      { path: "/payment-success", element: <PaymentSuccess /> },
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
