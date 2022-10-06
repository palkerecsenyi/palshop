import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth, getIdToken } from "firebase/auth"
import { getFunctions, httpsCallable } from "firebase/functions"

interface StripeStatus {
    balance: number
    email: string
}
export const useStripeStatus = () => {
    const [status, setStatus] = useState<StripeStatus>()
    const [user] = useAuthState(getAuth())

    useEffect(() => {
        if (!user) return
        (async () => {
            const token = await getIdToken(user)
            const functions = getFunctions(undefined, "europe-west2")
            const response = await httpsCallable<{ token: string }, StripeStatus>(functions, "getDetails")({
                token,
            })

            setStatus(response.data)
        })()
    }, [user])

    return status
}
