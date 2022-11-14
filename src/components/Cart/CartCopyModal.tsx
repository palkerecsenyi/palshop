import { usePastTrips } from "../../data/trips"
import Select from "../Select"
import { useCallback, useMemo, useState } from "react"
import { timestampFormat } from "../../data/util"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"
import { copyCart } from "../../data/cart"
import ErrorComponent from "../Error"

type props = {
    tripId: string
    cartId: string
    close(): void
}

export default function CartCopyModal(
    {tripId, cartId, close}: props
) {
    const [pastTrips, pastTripsLoading] = usePastTrips()

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

    return <div className="modal is-active">
        <div
            className="modal-background"
            onClick={close}
        />
        <div className="modal-card">
            <header className="modal-card-head">
                <p className="modal-card-title">
                    Copy cart
                </p>
                <button
                    className="delete"
                    aria-label="Close"
                    onClick={close}
                ></button>
            </header>
            <section className="modal-card-body">
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
            </section>
            <footer className="modal-card-foot">
                <button
                    className="button is-success"
                    disabled={selectedTrip === "" || copyLoading}
                    onClick={doCopy}
                >
                    Copy!
                </button>
            </footer>
        </div>
    </div>
}