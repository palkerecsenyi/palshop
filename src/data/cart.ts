import { useEffect, useState } from "react"
import type { WithId } from "./types"
import {
    collection,
    getFirestore,
    onSnapshot,
    query,
    where,
    addDoc,
    updateDoc,
    doc,
    deleteDoc,
    Timestamp, orderBy,
} from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"

export interface Cart {
    trip: string
    owner: string
    total: number
}

export interface CartItem {
    name: string
    quantity: number
    price: number
    createdAt: Timestamp
}

export const useCart = (tripId?: string) => {
    const [cart, setCart] = useState<WithId<Cart> | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [authState] = useAuthState(getAuth())

    useEffect(() => {
        if (!authState || !tripId) return

        const firestore = getFirestore()
        const q = query(
            collection(firestore, "trips", tripId, "carts"),
            where("owner", "==", authState.uid)
        )
        return onSnapshot(q, snapshot => {
            if (snapshot.empty) {
                setCart(undefined)
            } else {
                const d = snapshot.docs[0]
                setCart({
                    ...d.data() as Cart,
                    id: d.id,
                })
            }

            setLoading(false)
        })
    }, [tripId, authState])

    return [cart, loading] as const
}

export const createCart = async (tripId: string, userId: string) => {
    const firestore = getFirestore()
    const cart: Cart = {
        trip: tripId,
        owner: userId,
        total: 0,
    }
    await addDoc(collection(firestore, "trips", tripId, "carts"), cart)
}

export const useCartItems = (tripId?: string, cartId?: string) => {
    const [items, setItems] = useState<WithId<CartItem>[]>([])
    useEffect(() => {
        if (!tripId || !cartId) return
        const firestore = getFirestore()
        return onSnapshot(query(
            collection(firestore, "trips", tripId, "carts", cartId, "items"),
            orderBy("createdAt", "desc")
        ), snapshot => {
            setItems(snapshot.docs.map(e => ({
                ...e.data() as CartItem,
                id: e.id,
            })))
        })
    }, [tripId, cartId])
    return items
}

export const addToCart = async (tripId: string, cartId: string, item: CartItem) => {
    const firestore = getFirestore()
    await addDoc(collection(firestore, "trips", tripId, "carts", cartId, "items"), item)
}

export const updateCartItem = async (tripId: string, cartId: string, itemId: string, item: Partial<CartItem>) => {
    const firestore = getFirestore()
    await updateDoc(doc(firestore, "trips", tripId, "carts", cartId, "items", itemId), item)
}

export const deleteCartItem = async (tripId: string, cartId: string, itemId: string) => {
    const firestore = getFirestore()
    await deleteDoc(doc(firestore, "trips", tripId, "carts", cartId, "items", itemId))
}
