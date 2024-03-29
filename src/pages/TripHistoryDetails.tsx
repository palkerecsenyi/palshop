import { useParams } from "react-router-dom"
import { formatTripStatus } from "../data/trips"
import { currencyFormat, timestampFormat } from "../data/util"
import { useInvoiceData } from "../data/stripe"
import PageContainer from "../components/PageContainer"
import HomeLink from "../components/HomeLink"
import { useAppSelector } from "../stores/hooks"
import { useHistoricTrips } from "../stores/historicTrips"
import { useMemo } from "react"
import { useCart, useCartItems } from "../data/cart"

export default function TripHistoryDetails() {
    const { id } = useParams<{id: string}>()
    useHistoricTrips()
    const {trips, tripsLoading} = useAppSelector(state => state.historicTripsReducer)
    const trip = useMemo(() => {
        return trips.find(e => e.id === id)
    }, [trips, id])

    const [cart, cartLoading] = useCart(trip?.id)
    const [cartItems] = useCartItems(trip?.id, cart?.id)

    const invoiceData = useInvoiceData(id, cart?.id)

    return <PageContainer>
        <HomeLink />

        <h1 className="title">
            Your shopping trip
        </h1>

        {!tripsLoading && !trip && <article className="message is-danger">
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
                        Your invoice for this trip is <strong>{invoiceData.isPaid ? 'paid (or otherwise complete)' : 'NOT paid'}</strong>.
                    </p>
                    <p>
                        The total invoiced amount (including fees) is <strong>{currencyFormat(invoiceData.total)}</strong>.
                    </p>
                    <p>
                        <a
                            href={invoiceData.link}
                            target="_blank"
                            className="button mt-2"
                            rel="noreferrer"
                        >
                            {invoiceData.isPaid ? 'View' : 'Pay'} invoice
                        </a>
                    </p>
                </div>
            </article>}

            {(!cart && !cartLoading) && <article className="message mt-4 is-info">
                <div className="message-body">
                    <p>
                        You didn't buy anything for this trip.
                    </p>
                </div>
            </article>}

            {cart && <div className="mt-4">
                <div className="content">
                    <ul>
                        {cartItems.map(item => <li key={item.id}>
                            {item.name} (x{item.quantity}) — {currencyFormat(item.price)}

                            {item.substitution && <ul>
                                <li>
                                    {item.substitution.price === 0 ? "Cancelled" : <>
                                        Substituted by {item.substitution.name} ({currencyFormat(item.substitution.price)})
                                    </>}
                                </li>
                            </ul>}
                        </li>)}
                    </ul>
                </div>
            </div>}
        </>}
    </PageContainer>
}
