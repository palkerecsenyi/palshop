import {
    Timestamp,
    query,
    collection,
    orderBy,
    limit,
    getDoc,
    where, doc,
} from "firebase/firestore"
import { createContext, useContext, useEffect, useState } from "react"
import type { WithId } from "./types"
import { firestoreConverter, useCollectionFirst, useFirestore } from "./util"
import { useCollectionData } from "react-firebase-hooks/firestore"

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
export const TripConverter = firestoreConverter<Trip>()

export const useCurrentTrip = () => {
    const firestore = useFirestore()
    const [trips, loading] = useCollectionData(
        query(
            collection(firestore, "trips"),
            orderBy("itemsDeadline", "desc"),
            limit(1),
        )
            .withConverter(TripConverter)
    )

    const trip = useCollectionFirst(trips)
    return [trip, loading] as const
}

export const useTripContext = () => useContext(TripContext)

export const usePastTrips = () => {
    const firestore = useFirestore()
    const [trips, loading] = useCollectionData(
        query(
            collection(firestore, "trips"),
            where("itemsDeadline", "<", Timestamp.now()),
            orderBy("itemsDeadline", "desc"),
        )
            .withConverter(TripConverter)
    )

    return [trips || [], loading] as const
}

export const usePastTrip = (id?: string) => {
    const firestore = useFirestore()
    const [trip, setTrip] = useState<WithId<Trip>>()
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        if (!id) return
        (async () => {
            const response = await getDoc(doc(firestore, "trips", id))
            if (response.exists()) {
                setTrip({
                    ...response.data() as Trip,
                    id: response.id,
                })
            } else {
                setTrip(undefined)
            }

            setLoading(false)
        })()
    }, [id, firestore])
    return [trip, loading] as const
}

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
