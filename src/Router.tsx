import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./pages/Login"
import RootPage from "./RootPage"
import ResetPassword from "./pages/ResetPassword"
import Trip from "./pages/Trip"
import Cart from "./pages/Cart"
import TripHistory from "./pages/TripHistory"
import TripHistoryDetails from "./pages/TripHistoryDetails"
import ShopFees from "./pages/ShopFees"
import About from "./pages/About"
import AccountSettings from "./pages/AccountSettings"

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
            {
                path: "fees",
                element: <ShopFees />,
            },
            {
                path: "account",
                element: <AccountSettings />,
            }
        ]
    },
    {
        path: "auth/login",
        element: <Login />,
    },
    {
        path: "auth/reset",
        element: <ResetPassword />
    },
    {
        path: "about",
        element: <About />,
    }
])

export default function Router() {
    return <RouterProvider router={router} />
}
