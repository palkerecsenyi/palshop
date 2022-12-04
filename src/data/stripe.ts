import { useEffect, useState } from "react"
import { httpsCallable } from "firebase/functions"
import { useFunctions } from "./util"
import { useHttpsCallable } from "react-firebase-hooks/functions"

interface StripeStatus {
    balance: number
    email: string
}
export const useStripeStatus = () => {
    const [status, setStatus] = useState<StripeStatus>()
    const functions = useFunctions()
    const [callable] = useHttpsCallable<undefined, StripeStatus>(functions, "getDetails")

    useEffect(() => {
        (async () => {
            const response = await callable()
            if (!response) {
                setStatus(undefined)
                return
            }
            setStatus(response.data)
        })()
    }, [callable])

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
    const functions = useFunctions()

    useEffect(() => {
        if (!tripId || !cartId) return
        (async () => {
            const func = httpsCallable<{ tripId: string, cartId: string }, StripeInvoiceData>(
                functions,
                "getCartInvoiceStatus",
            )

            try {
                const response = await func({
                    tripId,
                    cartId,
                })
                setData(response.data)
            } catch (e) {
                setData(undefined)
            }
        })()
    }, [tripId, cartId, functions])

    return data
}

export const stripeCardBrandFormat = (cardBrand: string) => {
    switch (cardBrand) {
        case "visa":
            return "Visa"
        case "mastercard":
            return "Mastercard"
    }
}
