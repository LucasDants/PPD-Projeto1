import { RouterProvider } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { router } from "./routes/index.routes"

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}