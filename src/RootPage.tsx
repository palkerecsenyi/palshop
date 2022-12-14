import { Outlet, useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"
import { useEffect } from "react"
import { TripContext, useCurrentTrip } from "./data/trips"
import { ShopMetadataContext, useShopMetadata } from "./data/shops"
import { OtherUsersContext, useOtherUsers } from "./data/sharing"

export default function RootPage() {
    const [user, userLoading] = useAuthState(getAuth())
    const navigate = useNavigate()
    useEffect(() => {
        if (!userLoading && !user) {
            navigate("/auth/login")
        }
    }, [user, userLoading, navigate])

    const [currentTrip] = useCurrentTrip()
    const shops = useShopMetadata()
    const otherUsers = useOtherUsers()

    return <TripContext.Provider value={currentTrip}>
        <ShopMetadataContext.Provider value={shops}>
            <OtherUsersContext.Provider value={otherUsers}>
                <Outlet />
            </OtherUsersContext.Provider>
        </ShopMetadataContext.Provider>
    </TripContext.Provider>
}
