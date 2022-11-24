import { useEffect, useState } from "react"
import { WithId } from "./types"
import { collection, deleteDoc, doc, getFirestore, onSnapshot, query, setDoc, where } from "firebase/firestore"

export interface Price {
    itemId: string
    cartId: string
    userId: string
    primary: boolean
    price: number
}

export const useSecondaryPrices = (tripId?: string, cartId?: string, itemId?: string) => {
    const [prices, setPrices] = useState<WithId<Price>[]>([])
    useEffect(() => {
        if (!tripId || !cartId || !itemId) {
            setPrices([])
            return
        }

        const firestore = getFirestore()
        const q = query(
            collection(firestore, "trips", tripId, "prices"),
            where("cartId", "==", cartId),
            where("itemId", "==", itemId),
            where("primary", "==", false),
        )
        return onSnapshot(q, snapshot => {
            const docs = snapshot.docs.map(e => ({
                ...e.data() as Price,
                id: e.id,
            }))
            setPrices(docs)
        })
    }, [tripId, cartId, itemId])

    return prices
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
