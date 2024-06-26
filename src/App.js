import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./App.css";
import { useEffect } from "react";
import { logOutRemote } from "./remoteControl";

function App() {
  useEffect(() => {
    const identifier = setTimeout(() => {
      localStorage.removeItem("profile");
      localStorage.removeItem("token");

      logOutRemote();
    }, 30 * 60 * 1000);

    return () => clearTimeout(identifier);
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
