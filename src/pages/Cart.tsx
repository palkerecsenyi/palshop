import { Link } from "react-router-dom"
import { formatTripStatus, TripStatus, useTripContext } from "../data/trips"
import { useCart, useCartItems } from "../data/cart"
import CartInit from "../components/Cart/CartInit"
import CartEmpty from "../components/Cart/CartEmpty"
import { useState } from "react"
import CartEdit from "../components/Cart/CartEdit"
import { currencyFormat } from "../data/util"
import CartItemComponent from "../components/Cart/CartItem"

export default function Cart() {
    const trip = useTripContext()
    const [cart, cartLoading] = useCart(trip?.id)
    const cartItems = useCartItems(trip?.id, cart?.id)

    const [adding, setAdding] = useState(false)

    if (!trip) {
        return <></>
    }

    if (trip.status !== TripStatus.AcceptingOrders) {
        return <div className="container py-6 px-4">
            <h1 className="title">
                Trip closed :(
            </h1>

            <p className="is-size-4">
                Unfortunately, this trip is closed and not accepting any more orders. At the moment, it's {formatTripStatus(trip.status)}.
            </p>

            <Link to="/" className="button mt-4">
                Back home
            </Link>
        </div>
    }

    return <div className="container py-6 px-4">
        <Link to="/" className="button mb-4">
            Back home
        </Link>

        <h1 className="title">
            My shopping cart
        </h1>

        {!cart && !cartLoading && <CartInit />}

        {cart && <>
            <p className="mb-4 is-size-4">
                Total: <strong>{currencyFormat(cart?.total)}</strong>
            </p>

            {cartItems.length === 0 && <CartEmpty />}
            {!adding && <button className="button" onClick={() => setAdding(true)}>
                Add item
            </button>}
            {adding && <CartEdit
                onDismiss={() => setAdding(false)}
                tripId={trip.id}
                cartId={cart.id}
            />}

            {cartItems.map(item => <CartItemComponent
                item={item}
                key={item.id}
                tripId={trip.id}
                cartId={cart.id}
            />)}
        </>}
    </div>
}
