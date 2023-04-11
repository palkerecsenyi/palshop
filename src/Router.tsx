import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Login from "./pages/Login"
import RootPage from "./RootPage"
import Trip from "./pages/Trip"
import Cart from "./pages/Cart"
import TripHistory from "./pages/TripHistory"
import TripHistoryDetails from "./pages/TripHistoryDetails"
import { lazy, Suspense } from "react"

const AccountSettings = lazy(() => import("./pages/AccountSettings"))
const AccountCardConfig = lazy(() => import("./pages/AccountCardConfig"))
const ShopFees = lazy(() => import("./pages/ShopFees"))
const About = lazy(() => import("./pages/About"))
const ResetPassword = lazy(() => import("./pages/ResetPassword"))

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
            },
            {
                path: "account/payment-method",
                element: <AccountCardConfig />,
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
    },
    {
        path: "about",
        element: <About />,
    }
])

export default function Router() {
    return <Suspense>
        <RouterProvider router={router} />
    </Suspense>
}
