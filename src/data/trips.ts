import {Timestamp, getFirestore, onSnapshot, query, collection, orderBy, limit} from "firebase/firestore"
import { createContext, useContext, useEffect, useState } from "react"
import type { WithId } from "./types"

export enum TripStatus {
    AcceptingOrders,
    Closed,
    OrderPlacedAwaitingDelivery,
    Complete,
}

export interface Trip {
    open: Timestamp
    itemsDeadline: Timestamp
    paymentDeadline: Timestamp
    delivery: Timestamp
    status: TripStatus
}

export const TripContext = createContext<WithId<Trip> | undefined>(undefined)

export const useCurrentTrip = () => {
    const [trip, setTrip] = useState<WithId<Trip> | undefined>(undefined)
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const firestore = getFirestore()
        const q = query(
            collection(firestore, "trips"),
            orderBy("itemsDeadline", "desc"),
            limit(1),
        )
        return onSnapshot(q, snapshot => {
            if (snapshot.empty) {
                setTrip(undefined)
            } else {
                const doc = snapshot.docs[0]
                setTrip({
                    ...doc.data() as Trip,
                    id: doc.id,
                })
            }
            setLoading(false)
        })
    }, [])

    return [trip, loading] as const
}

export const useTripContext = () => useContext(TripContext)

export const formatTripStatus = (status: TripStatus) => {
    switch (status) {
        case TripStatus.AcceptingOrders:
            return "open and accepting orders"
        case TripStatus.Closed:
            return "closed and about to be placed"
        case TripStatus.OrderPlacedAwaitingDelivery:
            return "placed and awaiting delivery"
        case TripStatus.Complete:
            return "complete and delivered"
    }
}
