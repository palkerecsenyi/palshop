import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import {getAuth, getIdToken} from "firebase/auth"
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

interface StripeInvoiceData {
    isPaid: boolean
    total: number
    number: string
    link: string
}

export const useInvoiceData = (tripId?: string, cartId?: string) => {
    const [data, setData] = useState<StripeInvoiceData>()
    const [user] = useAuthState(getAuth())

    useEffect(() => {
        if (!user || !tripId || !cartId) return
        (async () => {
            const token = await getIdToken(user)
            const functions = getFunctions(undefined, "europe-west2")
            const func = httpsCallable<{ token: string, tripId: string, cartId: string }, StripeInvoiceData>(
                functions,
                "getCartInvoiceStatus",
            )

            try {
                const response = await func({
                    token,
                    tripId,
                    cartId
                })
                setData(response.data)
            } catch (e) {
                setData(undefined)
            }
        })()
    }, [tripId, cartId, user])

    return data
}
