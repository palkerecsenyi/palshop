import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { WithId } from "./types"
import { collection, deleteDoc, doc, getFirestore, onSnapshot, setDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"
import { CartItem, CartItemConverter } from "./cart"
import { firestoreConverter, useAuth, useFirestore } from "./util"
import { useDocumentDataOnce } from "react-firebase-hooks/firestore"

export interface Price {
    itemId: string
    cartId: string
    userId: string
    primary: boolean
    price: number
}

export const LocalPricesContext = createContext<WithId<Price>[]>([])
export const useLocalPricesContext = () => useContext(LocalPricesContext)
export const PriceConverter = firestoreConverter<Price>()

export const useAllPrices = (tripId?: string) => {
    const firestore = useFirestore()
    const [prices, setPrices] = useState<WithId<Price>[]>([])
    const [user] = useAuthState(getAuth())

    useEffect(() => {
        if (!tripId || !user) return
        const q = collection(firestore, "trips", tripId, "prices").withConverter(PriceConverter)
        return onSnapshot(q, snapshot => {
            const docs = snapshot.docs.map(e => e.data())
            setPrices(docs)
        })
    }, [tripId, user, firestore])
    return prices
}

export const usePricesSharedWithMeContext = () => {
    const allPrices = useLocalPricesContext()
    const auth = useAuth()
    const [user] = useAuthState(auth)
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

export const usePriceItem = (tripId: string, price: Price): WithId<CartItem> | undefined => {
    const firestore = useFirestore()
    const [item] = useDocumentDataOnce(
        doc(firestore, "trips", tripId, "carts", price.cartId, "items", price.itemId)
            .withConverter(CartItemConverter)
    )
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
