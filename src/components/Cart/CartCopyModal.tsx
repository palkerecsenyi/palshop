import Select from "../Select"
import { useCallback, useMemo, useState } from "react"
import { timestampFormat } from "../../data/util"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"
import { copyCart } from "../../data/cart"
import ErrorComponent from "../Error"
import Modal from "../Modal"
import { useAppSelector } from "../../stores/hooks"
import { useHistoricTrips } from "../../stores/historicTrips"

type props = {
    tripId: string
    cartId: string
    close(): void
}

export default function CartCopyModal(
    {tripId, cartId, close}: props
) {
    useHistoricTrips()
    const {trips: pastTrips, tripsLoading: pastTripsLoading} = useAppSelector(state => state.historicTripsReducer)

    const [selectedTrip, setSelectedTrip] = useState("")
    const tripOptions = useMemo(() => {
        return pastTrips.map(trip => {
            const dateLabel = timestampFormat(trip.itemsDeadline)
            return [
                trip.id,
                dateLabel,
            ] as const
        })
    }, [pastTrips])

    const [authUser] = useAuthState(getAuth())
    const [copyLoading, setCopyLoading] = useState(false)
    const [error, setError] = useState<string>()
    const doCopy = useCallback(async () => {
        if (!authUser || !selectedTrip) return

        setCopyLoading(true)
        setError(undefined)
        try {
            await copyCart(
                selectedTrip,
                tripId,
                cartId,
                authUser.uid,
            )

            close()
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message)
            } else {
                setError("Something went wrong.")
            }
        }
        setCopyLoading(false)
    }, [authUser, tripId, cartId, selectedTrip, close])

    return <Modal
        close={close}
        title="Copy cart"
        footer={(
            <button
                className={`button is-success ${copyLoading ? 'is-loading' : ''}`}
                disabled={selectedTrip === "" || copyLoading}
                onClick={doCopy}
            >
                Copy!
            </button>
        )}
    >
        {pastTripsLoading && <p>
            Loading...
        </p>}

        {!pastTripsLoading && <>
            <p className="mb-2">
                Select a previous trip to copy your items from...
            </p>
            <Select
                label="Trip closed at..."
                options={tripOptions}
                value={selectedTrip}
                onChange={e => setSelectedTrip(e.target.value)}
                disabled={copyLoading}
            />

            <ErrorComponent text={error} />
        </>}
    </Modal>
}
