import { useEffect, useState } from "react"
import { getFunctions, httpsCallable } from "firebase/functions"

interface StripeStatus {
    balance: number
    email: string
}
export const useStripeStatus = () => {
    const [status, setStatus] = useState<StripeStatus>()

    useEffect(() => {
        (async () => {
            const functions = getFunctions(undefined, "europe-west2")
            const response = await httpsCallable<{ token: string }, StripeStatus>(functions, "getDetails")()

            setStatus(response.data)
        })()
    }, [])

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

    useEffect(() => {
        if (!tripId || !cartId) return
        (async () => {
            const functions = getFunctions(undefined, "europe-west2")
            const func = httpsCallable<{ tripId: string, cartId: string }, StripeInvoiceData>(
                functions,
                "getCartInvoiceStatus",
            )

            try {
                const response = await func({
                    tripId,
                    cartId
                })
                setData(response.data)
            } catch (e) {
                setData(undefined)
            }
        })()
    }, [tripId, cartId])

    return data
}
