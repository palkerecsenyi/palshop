import { Outlet, useNavigate } from "react-router-dom"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"
import { useEffect } from "react"
import { TripContext, useCurrentTrip } from "./data/trips"

export default function RootPage() {
    const [user, userLoading] = useAuthState(getAuth())
    const navigate = useNavigate()
    useEffect(() => {
        if (!userLoading && !user) {
            navigate("/auth/login")
        }
    }, [user, userLoading, navigate])

    const [currentTrip] = useCurrentTrip()

    return <TripContext.Provider value={currentTrip}>
        <Outlet />
    </TripContext.Provider>
}
