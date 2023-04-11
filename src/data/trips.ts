import {
    Timestamp,
    query,
    collection,
    orderBy,
    limit,
} from "firebase/firestore"
import { useEffect } from "react"
import { firestoreConverter, useCollectionFirst, useFirestore } from "./util"
import { useCollectionData } from "react-firebase-hooks/firestore"
import { useAppDispatch, useAppSelector } from "../stores/hooks"
import { clearTrip, updateTrip } from "../stores/trip"

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

export const TripConverter = firestoreConverter<Trip>()

export const useCurrentTrip = () => {
    const dispatch = useAppDispatch()
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
    useEffect(() => {
        if (loading) return

        if (trip) {
            dispatch(updateTrip(trip))
        } else {
            dispatch(clearTrip())
        }
    }, [trip, loading, dispatch])
}

export const useTripSelector = () => useAppSelector(state => state.tripsReducer.currentTrip)

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
