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
    Timestamp, orderBy, collectionGroup,
} from "firebase/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth, getIdToken } from "firebase/auth"
import {getFunctions, httpsCallable} from "firebase/functions"

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
    shared?: {
        otherUserId: string
        otherUserPays: number
    }
    // for collectionGroup queries
    tripId: string
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

export interface OtherUserDetail {
    id: string
    email: string
}
export const useOtherUsers = () => {
    const [otherUsers, setOtherUsers] = useState<OtherUserDetail[]>([])
    const [user] = useAuthState(getAuth())
    useEffect(() => {
        if (!user) return
        (async () => {
            const functions = getFunctions(undefined, "europe-west2")
            const callable = httpsCallable<{token: string}, OtherUserDetail[]>(functions, "getOtherUserList")
            const token = await getIdToken(user)
            const response = await callable({
                token,
            })

            setOtherUsers(response.data)
        })()
    }, [user])

    return otherUsers
}

export const useSharedWithMe = (tripId?: string) => {
    const [items, setItems] = useState<WithId<CartItem>[]>([])
    const [user] = useAuthState(getAuth())

    useEffect(() => {
        if (!tripId || !user) return
        const firestore = getFirestore()
        return onSnapshot(query(
            collectionGroup(firestore, "items"),
            where("tripId", "==", tripId),
            where("shared.otherUserId", '==', user.uid)
        ), (snapshot) => {
            setItems(snapshot.docs.map(e => ({
                ...e.data() as CartItem,
                id: e.id,
            })))
        })
    }, [tripId, user?.uid])

    return items
}

