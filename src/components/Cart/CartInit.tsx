import { useCallback, useState } from "react"
import { useTripContext } from "../../data/trips"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"
import { createCart } from "../../data/cart"

export default function CartInit() {
    const [loading, setLoading] = useState(false)
    const trip = useTripContext()
    const [authState] = useAuthState(getAuth())
    const submit = useCallback(async () => {
        if (!trip || !authState) return
        setLoading(true)
        await createCart(trip.id, authState.uid)
    }, [trip, authState])

    return <article className="message is-info">
        <div className="message-header">
            <p>Welcome!</p>
        </div>
        <div className="message-body content">
            <p>
                Hello. This is Pal talking at you from behind your screen.
            </p>
            <p>
                Before starting your shopping, please take a few moments to read how it works:
            </p>

            <ol>
                <li>
                    Place an item into the shared ASDA cart.
                </li>
                <li>
                    Add the item's name (try to be specific), your quantity, and <strong>the total price</strong>.
                    Don't add the price of each individual item, just the final price you're paying. This makes it
                    easier to account for offers and "2 for 1" discounts, etc.
                </li>
                <li>
                    Once you've added your items, you don't need to do anything. At the deadline listed on the home
                    page, your cart will get locked and the ASDA order will be placed, usually for <strong>next-day delivery</strong>.
                    The expected delivery time will be shown too.
                </li>
                <li>
                    If possible, <strong>please be present for the delivery time</strong>, especially if a lot of people are ordering
                    together.
                </li>
                <li>
                    At the shopping deadline, you'll get an automated notification email with a payment link. Please
                    complete the payment by the deadline listed on the home page.
                </li>
            </ol>

            <button onClick={submit} className="button" disabled={loading}>
                Start shopping
            </button>
        </div>
    </article>
}
