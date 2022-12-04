import {
    Timestamp,
    FirestoreDataConverter,
    WithFieldValue,
    DocumentData,
    QueryDocumentSnapshot,
    SnapshotOptions,
    getFirestore,
} from "firebase/firestore"
import { DateTime } from "luxon"
import { WithId } from "./types"
import { useMemo } from "react"
import { getAuth } from "firebase/auth"
import { getFunctions } from "firebase/functions"

export const timestampFormat = (timestamp: Timestamp) => DateTime.fromJSDate(timestamp.toDate()).toFormat("DDDD HH:mm")

export const currencyFormat = (value: number) => "£" + (value / 100).toFixed(2)

export const firestoreConverter = <T>(): FirestoreDataConverter<WithId<T>> => {
    return {
        toFirestore(modelObject: WithFieldValue<WithId<T>>): DocumentData {
            const {id, ...data} = modelObject
            return data
        },
        fromFirestore(snapshot: QueryDocumentSnapshot, options?: SnapshotOptions): WithId<T> {
            return {
                ...snapshot.data(options) as T,
                id: snapshot.id,
            }
        }
    }
}

export const useAuth = () => useMemo(() => getAuth(), [])
export const useFirestore = () => useMemo(() => getFirestore(), [])
export const useFunctions = () => useMemo(() => getFunctions(undefined, "europe-west2"), [])
export const useCollectionFirst = <T>(d: T[] | undefined) => useMemo(() => {
    if (!d || d.length === 0) return undefined
    return d[0]
}, [d])
