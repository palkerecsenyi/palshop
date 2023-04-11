import { useEffect, useState } from "react"
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
import { useAppDispatch, useAppSelector } from "../stores/hooks"
import { clearCartCache, updateCart, updateCartItems } from "../stores/trip"
import { WithId } from "./types"

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

export function useCart(argTripId?: string) {
    const globalTripId = useAppSelector(state => state.tripsReducer.currentTrip?.id)
    const tripId = argTripId ?? globalTripId
    const firestore = useFirestore()
    const [authState] = useAuthState(getAuth())

    const dispatch = useAppDispatch()
    const [cart, setCart] = useState<WithId<Cart>>()
    const [loading, setLoading] = useState<boolean>(true)

    useEffect(() => {
        if (!authState || !tripId) return

        const q = query(
            collection(firestore, "trips", tripId, "carts"),
            where("owner", "==", authState.uid)
        ).withConverter(CartConverter)
        return onSnapshot(q, snapshot => {
            if (snapshot.empty) {
                setCart(undefined)
                if (!argTripId) dispatch(clearCartCache())
            } else {
                const d = snapshot.docs[0]
                const newCart = {
                    ...d.data(),
                    id: d.id,
                }
                setCart(newCart)
                if (!argTripId) dispatch(updateCart(newCart))
            }

            setLoading(false)
        })
    }, [tripId, authState, firestore, dispatch, argTripId])

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

export const useCartItems = (argTripId?: string, argCartId?: string) => {
    const globalTripId = useAppSelector(state => state.tripsReducer.currentTrip?.id)
    const tripId = argTripId ?? globalTripId
    const globalCartId = useAppSelector(state => state.tripsReducer.cart?.id)
    const cartId = argCartId ?? globalCartId

    const [cartItems, setCartItems] = useState<WithId<CartItem>[]>([])
    const [loading, setLoading] = useState(true)

    const firestore = useFirestore()
    const dispatch = useAppDispatch()
    useEffect(() => {
        if (!tripId || !cartId) return
        const q = query(
            collection(firestore, "trips", tripId, "carts", cartId, "items"),
            orderBy("createdAt", "desc")
        ).withConverter(CartItemConverter)
        return onSnapshot(q, snapshot => {
            const newCartItems = snapshot.docs.map(e => e.data())
            if (!argTripId && !argCartId) dispatch(updateCartItems(newCartItems))
            setLoading(false)
            setCartItems(newCartItems)
        })
    }, [tripId, cartId, firestore, dispatch, argTripId, argCartId])

    return [cartItems, loading] as const
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
        const newItemRef = doc(collection(
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
