import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { WithId } from "./types"
import { collection, deleteDoc, doc, getDoc, getFirestore, onSnapshot, setDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"
import { CartItem } from "./cart"

export interface Price {
    itemId: string
    cartId: string
    userId: string
    primary: boolean
    price: number
}

export const LocalPricesContext = createContext<WithId<Price>[]>([])
export const useLocalPricesContext = () => useContext(LocalPricesContext)

export const useAllPrices = (tripId?: string) => {
    const [prices, setPrices] = useState<WithId<Price>[]>([])
    const [user] = useAuthState(getAuth())

    useEffect(() => {
        if (!tripId || !user) return
        const firestore = getFirestore()
        return onSnapshot(collection(firestore, "trips", tripId, "prices"), snapshot => {
            const docs = snapshot.docs.map(e => ({
                ...e.data() as Price,
                id: e.id,
            }))
            setPrices(docs)
        })
    }, [tripId, user])
    return prices
}

export const usePricesSharedWithMeContext = () => {
    const allPrices = useLocalPricesContext()
    const [user] = useAuthState(getAuth())
    return useMemo(() => {
        if (!user?.uid) return []

        return allPrices.filter(e => {
            return !e.primary && e.userId === user.uid
        })
    }, [allPrices, user?.uid])
}

export const useItemSharedToContext = (itemId?: string) => {
    const allPrices = useLocalPricesContext()
    return useMemo(() => {
        if (!itemId) return []

        return allPrices.filter(e => {
            return !e.primary && e.itemId === itemId
        })
    }, [allPrices, itemId])
}

export const usePriceItem = (tripId: string, price: Price) => {
    const [item, setItem] = useState<WithId<CartItem>>()
    useEffect(() => {
        const firestore = getFirestore();
        (async () => {
            const response = await getDoc(
                doc(firestore, "trips", tripId, "carts", price.cartId, "items", price.itemId)
            )
            if (!response.exists()) return

            setItem({
                ...response.data() as CartItem,
                id: response.id,
            })
        })()
    })
    return item
}

export const deletePrice = async (tripId: string, priceId: string) => {
    const firestore = getFirestore()
    await deleteDoc(doc(firestore, "trips", tripId, "prices", priceId))
}

export const setPrice = async (tripId: string, priceId: string, price: Partial<Price>) => {
    const firestore = getFirestore()
    await setDoc(doc(firestore, "trips", tripId, "prices", priceId), price, {
        merge: false,
    })
}
