import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./pages/Login"
import RootPage from "./RootPage"
import ResetPassword from "./pages/ResetPassword"
import Trip from "./pages/Trip"
import Cart from "./pages/Cart"
import TripHistory from "./pages/TripHistory"
import TripHistoryDetails from "./pages/TripHistoryDetails"

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootPage />,
        children: [
            {
                path: "/",
                element: <Trip />
            },
            {
                path: "cart",
                element: <Cart />,
            },
            {
                path: "history",
                element: <TripHistory />,
            },
            {
                path: "history/:id",
                element: <TripHistoryDetails />,
            },
        ]
    },
    {
        path: "auth/login",
        element: <Login />,
    },
    {
        path: "auth/reset",
        element: <ResetPassword />
    }
])

export default function Router() {
    return <RouterProvider router={router} />
}
