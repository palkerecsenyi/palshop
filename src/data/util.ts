import { Timestamp } from "firebase/firestore"
import { DateTime } from "luxon"

export const timestampFormat = (timestamp: Timestamp) => DateTime.fromJSDate(timestamp.toDate()).toFormat("DDDD HH:mm")

export const currencyFormat = (value: number) => "£" + (value / 100).toFixed(2)
