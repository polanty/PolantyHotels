import "./App.css";

import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      {/* Header / Nav could go here */}
      <Outlet />
      {/* Footer could go here */}
    </>
  );
}

export default App;
