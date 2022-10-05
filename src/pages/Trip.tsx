import { formatTripStatus, TripStatus, useTripContext } from "../data/trips"
import { timestampFormat } from "../data/util"
import { Link } from "react-router-dom"

export default function Trip() {
    const trip = useTripContext()

    if (!trip) {
        return <></>
    }

    return <div className="container py-6">
        <h1 className="title">
            Current shopping trip
        </h1>

        <p>
            The deadline for order submissions is <strong>{timestampFormat(trip.itemsDeadline)}</strong>.
        </p>
        <p>
            After this time, payments will open. Please make payments by <strong>{timestampFormat(trip.paymentDeadline)}</strong>.
        </p>

        <article className={`message mt-4 ${trip.status === TripStatus.AcceptingOrders ? 'is-success' : 'is-info'}`}>
            <div className="message-header">
                <p>Order status</p>
            </div>
            <div className="message-body">
                <p>
                    This shopping trip is currently <strong>{formatTripStatus(trip.status)}</strong>.
                </p>
                {trip.status === TripStatus.AcceptingOrders && <p>
                    You can use the button below to register your cart contents.
                </p>}
                {trip.status === TripStatus.OrderPlacedAwaitingDelivery && <p>
                    Delivery is scheduled for <strong>{timestampFormat(trip.delivery)}</strong>.
                </p>}
            </div>
        </article>

        {trip.status === TripStatus.AcceptingOrders && <Link
            className="button is-primary"
            to="/cart"
        >
            Edit my cart
        </Link>}
    </div>
}
