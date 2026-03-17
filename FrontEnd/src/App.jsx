import { RouterProvider } from "react-router-dom"
import { router } from "./app.routes.jsx"
import { AuthProvider } from "./auth/auth.context.jsx";
import { InterviewProvider } from "./interview/Interview.context.jsx";

const App = () => {
  return (
    <AuthProvider>
      <InterviewProvider>
      <RouterProvider router={router} />
      </InterviewProvider>
    </AuthProvider>
  )
}

export default App