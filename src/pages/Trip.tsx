import { formatTripStatus, TripStatus, useTripContext } from "../data/trips"
import { currencyFormat, timestampFormat } from "../data/util"
import { Link } from "react-router-dom"
import { useStripeStatus } from "../data/stripe"
import { useCallback } from "react"
import { getAuth, signOut } from "firebase/auth"

export default function Trip() {
    const trip = useTripContext()
    const status = useStripeStatus()

    const logOut = useCallback(async () => {
        const auth = getAuth()
        await signOut(auth)
    }, [])

    if (!trip) {
        return <></>
    }

    return <div className="container py-6 px-4">
        <button className="button mb-4" onClick={logOut}>
            Log out
        </button>

        <h1 className="title">
            Current shopping trip
        </h1>

        <p>
            The deadline for order submissions is <strong>{timestampFormat(trip.itemsDeadline)}</strong>.
        </p>
        <p>
            After this time, payments will open. Please make payments by <strong>{timestampFormat(trip.paymentDeadline)}</strong>.
        </p>

        {status && <p>
            Your invoices will be emailed to <strong>{status.email}</strong>.
        </p>}

        {status && status.balance !== 0 && <article className="message mt-4 is-success">
            <div className="message-body">
                <p>
                    <strong>You have a balance!</strong>
                </p>
                <p>
                    Your account has a balance of <strong>{currencyFormat(status.balance)}</strong>. This
                    will be applied as a {status.balance > 0 ? 'discount' : 'surcharge'} to your next order.
                </p>
                {status.balance > 0 && <p>
                    This might be because an item in a previous order got substituted for a cheaper alternative.
                </p>}
                {status.balance < 0 && <p>
                    This might be because you were accidentally missing a charge in your last order.
                </p>}
            </div>
        </article>}

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
                {trip.status === TripStatus.Complete && <p>
                    The next shopping trip will be opened soon! Please ask Pal if you really need it open now.
                </p>}
            </div>
        </article>

        <div className="buttons">
            {trip.status === TripStatus.AcceptingOrders && <Link
                className="button is-primary"
                to="/cart"
            >
                Edit my cart
            </Link>}
            <Link
                className="button"
                to="/history"
            >
                Trip history
            </Link>
        </div>
    </div>
}
