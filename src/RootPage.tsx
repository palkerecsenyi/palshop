import { Outlet, useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"
import { useEffect } from "react"
import { useCurrentTrip } from "./data/trips"
import { useShopMetadata } from "./data/shops"
import { useOtherUsers } from "./stores/otherUsers"
import { useUserDetails } from "./stores/userDetails"
import { useMyAccountSettings } from "./data/account"
import { useMotd } from "./stores/trip"
import { useCart, useCartItems } from "./data/cart"
import { useAllPrices } from "./data/price"

export default function RootPage() {
    const [user, userLoading] = useAuthState(getAuth())
    const navigate = useNavigate()
    useEffect(() => {
        if (!userLoading && !user) {
            navigate("/auth/login")
        }
    }, [user, userLoading, navigate])

    useCurrentTrip()
    useShopMetadata()
    useOtherUsers()
    useUserDetails()
    useMyAccountSettings()
    useMotd()
    useCart()
    useCartItems()
    useAllPrices()

    return <Outlet />
}
