import Home from "@/pages/Home";
import Room from "@/pages/Room";
import { createBrowserRouter } from "react-router-dom";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/:roomId",
    element: <Room />
  }
]);