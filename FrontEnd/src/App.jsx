import {RouterProvider} from "react-router-dom"
import {router} from "./app.routes.jsx"
import { AuthProvider } from "./auth/auth.context.jsx";

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

export default App