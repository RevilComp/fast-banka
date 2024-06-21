import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./App.css";
import * as RemoteController from "./remoteControl";

function App() {
  const themeState = useSelector((state) => state.theme);
  // const dispatch = useDispatch();

  const { theme } = themeState;

  // Switching theme dynamically
  // window
  //   .matchMedia("(prefers-color-scheme: dark)")
  //   .addEventListener("change", (e) =>
  //     dispatch(themeSliceActions.switchTheme(e.matches ? "dark" : "light"))
  //   );

  useEffect(() => {
    RemoteController.isLogin();
    const [html, body] = [
      document.querySelector("html"),
      document.querySelector("body"),
    ];

    if (theme === "dark") html.className = "dark";
    else if (theme === "light") html.className = "";

    // body.className = "bg-white text-dark dark:bg-black dark:text-white";
    body.className = "bg-light text-dark";
  }, [theme]);

  return <RouterProvider router={router} />;
}

export default App;
