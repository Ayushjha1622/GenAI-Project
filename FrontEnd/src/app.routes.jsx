import { createBrowserRouter } from "react-router-dom";
import Login from './auth/pages/Login'
import Register from './auth/pages/Register'
import Protected from "./auth/components/Protected";
import Home from "./interview/pages/Home";


export const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />
    },
    {
        path: '/register',
        element: <Register />
    },{
        path: '/',
        element: <Protected><Home /></Protected>
    }
])
