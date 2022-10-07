import { Link, useParams } from "react-router-dom"
import { formatTripStatus, usePastTrip } from "../data/trips"
import { currencyFormat, timestampFormat } from "../data/util"
import { useCart, useCartItems } from "../data/cart"
import { useInvoiceData } from "../data/stripe"

export default function TripHistoryDetails() {
    const { id } = useParams<{id: string}>()
    const [trip, tripLoading] = usePastTrip(id)

    const [cart, cartLoading] = useCart(id)
    const cartItems = useCartItems(id, cart?.id)

    const invoiceData = useInvoiceData(id, cart?.id)

    return <div className="container py-6 px-4">
        <Link to="/history" className="button mb-4">
            Back to all trips
        </Link>

        <h1 className="title">
            Your shopping trip
        </h1>

        {!tripLoading && !trip && <article className="message is-danger">
            <div className="message-body">
                <p>
                    <strong>Trip not found!</strong>&nbsp;Make sure you've entered the trip ID correctly.
                </p>
            </div>
        </article>}

        {trip && <>
            <article className="message">
                <div className="message-body">
                    <p>
                        This trip is currently <strong>{formatTripStatus(trip.status)}</strong>.
                    </p>
                </div>
            </article>

            <p>
                Items deadline: <strong>{timestampFormat(trip.itemsDeadline)}</strong>
            </p>
            <p>
                Delivery: <strong>{timestampFormat(trip.delivery)}</strong>
            </p>
            <p>
                Payment deadline: <strong>{timestampFormat(trip.paymentDeadline)}</strong>
            </p>

            {invoiceData && <article className={`message mt-4 ${invoiceData.isPaid ? 'is-success' : 'is-warning'}`}>
                <div className="message-header">
                    <p>
                        Your invoice (#{invoiceData.number})
                    </p>
                </div>
                <div className="message-body">
                    <p>
                        Your invoice for this trip is <strong>{invoiceData.isPaid ? 'paid :)' : 'NOT paid'}</strong>.
                    </p>
                    <p>
                        The total invoiced amount (including fees) is <strong>{currencyFormat(invoiceData.total)}</strong>.
                    </p>
                    {!invoiceData.isPaid && <p>
                        <a
                            href={invoiceData.link}
                            target="_blank"
                            className="button mt-2"
                            rel="noreferrer"
                        >
                            Pay invoice
                        </a>
                    </p>}
                </div>
            </article>}

            {((!cart && !cartLoading) || cart?.total === 0) && <article className="message mt-4 is-info">
                <div className="message-body">
                    <p>
                        You didn't buy anything for this trip.
                    </p>
                </div>
            </article>}

            {cart && cart.total > 0 && <div className="mt-4">
                <p className="is-size-4">
                    Cart total: <strong>{currencyFormat(cart.total)}</strong>
                </p>
                <div className="content">
                    <ul>
                        {cartItems.map(item => <li key={item.id}>
                            {item.name} (x{item.quantity}) — {currencyFormat(item.price)}
                        </li>)}
                    </ul>
                </div>
            </div>}
        </>}
    </div>
}
