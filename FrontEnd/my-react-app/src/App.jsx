import "./App.css";

import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe } from "./store/auth/auth.thunks";
import { selectBootstrapped } from "./store/auth/auth.selectors";
import Navbar from "./Components/NavBar/NavBar";
import Footer from "./Components/Footer/Footer";

function App() {
  const dispatch = useDispatch();
  const bootstrapped = useSelector(selectBootstrapped);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  console.log(`Bootstrap Before: ${bootstrapped}`);

  // Optional: show splash while checking cookie session
  if (!bootstrapped) {
    return <div className="splash">Loading...</div>;
  }
  // or your loading component

  //console.log(`Bootstrap After: ${bootstrapped}`);

  return (
    <div>
      <Navbar />
      <main style={{ padding: 16 }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
