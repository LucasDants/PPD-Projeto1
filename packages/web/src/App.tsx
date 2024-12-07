import { RouterProvider } from "react-router-dom"
import { Toaster } from "./components/ui/toaster"
import { router } from "./routes/index.routes"
import { main } from "./services/trpc"
main()
export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  )
}