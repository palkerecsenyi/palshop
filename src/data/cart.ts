import { useEffect, useState } from "react"
import type { WithId } from "./types"
import {
    collection,
    getFirestore,
    onSnapshot,
    query,
    where,
    setDoc,
    doc,
    deleteDoc,
    Timestamp, orderBy, getDocs, writeBatch,
} from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"
import { firestoreConverter, useFirestore } from "./util"
import { v4 as uuid } from "uuid"

export interface Cart {
    trip: string
    owner: string
}

export const CartConverter = firestoreConverter<Cart>()

export interface CartItemSubstitution {
    name: string
    price: number
}

export interface CartItem {
    name: string
    quantity: number
    price: number
    substitution?: CartItemSubstitution
    createdAt: Timestamp
    // for collectionGroup queries
    tripId: string
    shopId: string
}

export const CartItemConverter = firestoreConverter<CartItem>()

export const useCart = (tripId?: string) => {
    const firestore = useFirestore()
    const [cart, setCart] = useState<WithId<Cart> | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    const [authState] = useAuthState(getAuth())

    useEffect(() => {
        if (!authState || !tripId) return

        const q = query(
            collection(firestore, "trips", tripId, "carts"),
            where("owner", "==", authState.uid)
        ).withConverter(CartConverter)
        return onSnapshot(q, snapshot => {
            if (snapshot.empty) {
                setCart(undefined)
            } else {
                const d = snapshot.docs[0]
                setCart(d.data())
            }

            setLoading(false)
        })
    }, [tripId, authState, firestore])

    return [cart, loading] as const
}

export const createCart = async (tripId: string, userId: string) => {
    const firestore = getFirestore()
    const cart: Cart = {
        trip: tripId,
        owner: userId,
    }
    const newCartId = uuid()
    await setDoc(doc(firestore, "trips", tripId, "carts", newCartId), cart)
}

export const useCartItems = (tripId?: string, cartId?: string) => {
    const firestore = useFirestore()
    const [items, setItems] = useState<WithId<CartItem>[]>([])
    useEffect(() => {
        if (!tripId || !cartId) return
        const q = query(
            collection(firestore, "trips", tripId, "carts", cartId, "items"),
            orderBy("createdAt", "desc")
        ).withConverter(CartItemConverter)
        return onSnapshot(q, snapshot => {
            setItems(snapshot.docs.map(e => e.data()))
        })
    }, [tripId, cartId, firestore])
    return items
}

export const setCartItem = async (tripId: string, cartId: string, itemId: string, item: Partial<CartItem>) => {
    const firestore = getFirestore()
    await setDoc(doc(firestore, "trips", tripId, "carts", cartId, "items", itemId), item, {
        merge: true,
    })
}

export const deleteCartItem = async (tripId: string, cartId: string, itemId: string) => {
    const firestore = getFirestore()
    await deleteDoc(doc(firestore, "trips", tripId, "carts", cartId, "items", itemId))
}

export const copyCart = async (
    fromTripId: string,
    toTripId: string,
    toCartId: string,
    userId: string
) => {
    const firestore = getFirestore()
    const fromTripCartResponse = await getDocs(query(
        collection(firestore, "trips", fromTripId, "carts"),
        where("owner", "==", userId),
    ))
    const fromTripCarts = fromTripCartResponse.docs
    if (fromTripCarts.length === 0) {
        throw new Error("User did not initialise a cart for this trip.")
    }

    const fromTripCart = {
        ...fromTripCarts[0].data() as Cart,
        id: fromTripCarts[0].id,
    }
    const fromTripItemsResponse = await getDocs(
        collection(firestore, "trips", fromTripId, "carts", fromTripCart.id, "items"),
    )

    const fromTripItems = fromTripItemsResponse.docs.map(doc => ({
        ...doc.data() as CartItem,
        id: doc.id,
    }))

    const batch = writeBatch(firestore)
    for (const item of fromTripItems) {
        const newItemRef = await doc(collection(
            firestore,
            "trips",
            toTripId,
            "carts",
            toCartId,
            "items",
        ))

        const newItemData: CartItem = {
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            createdAt: Timestamp.now(),
            tripId: toTripId,
            shopId: item.shopId,
        }

        batch.set(newItemRef, newItemData)
    }

    await batch.commit()
}
