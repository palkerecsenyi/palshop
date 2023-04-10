import { useEffect, useMemo } from "react"
import { WithId } from "./types"
import { collection, deleteDoc, doc, getFirestore, onSnapshot, setDoc } from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"
import { CartItem, CartItemConverter } from "./cart"
import { firestoreConverter, useAuth, useFirestore } from "./util"
import { useDocumentDataOnce } from "react-firebase-hooks/firestore"
import { useAppDispatch, useAppSelector } from "../stores/hooks"
import { updateAllPrices } from "../stores/trip"

export interface Price {
    itemId: string
    cartId: string
    userId: string
    primary: boolean
    price: number
}

export const PriceConverter = firestoreConverter<Price>()

export const useAllPrices = () => {
    const firestore = useFirestore()
    const tripId = useAppSelector(state => state.tripsReducer.currentTrip?.id)
    const [user] = useAuthState(getAuth())

    const dispatch = useAppDispatch()

    useEffect(() => {
        if (!tripId || !user) return
        const q = collection(firestore, "trips", tripId, "prices").withConverter(PriceConverter)
        return onSnapshot(q, snapshot => {
            const docs = snapshot.docs.map(e => e.data())
            dispatch(updateAllPrices(docs))
        })
    }, [tripId, user, firestore, dispatch])
}

const useAllPricesSelector = () => useAppSelector(state => state.tripsReducer.allPrices)

export const usePricesSharedWithMeSelector = () => {
    const allPrices = useAllPricesSelector()
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
    const allPrices = useAllPricesSelector()
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
