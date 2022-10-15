import { Link } from "react-router-dom"
import { formatTripStatus, TripStatus, useTripContext } from "../data/trips"
import { useCart, useCartItems, useOtherUsers, useSharedWithMe } from "../data/cart"
import CartInit from "../components/Cart/CartInit"
import CartEmpty from "../components/Cart/CartEmpty"
import { useMemo, useState } from "react"
import CartEdit from "../components/Cart/CartEdit"
import { currencyFormat } from "../data/util"
import CartItemComponent from "../components/Cart/CartItem"

export default function Cart() {
    const trip = useTripContext()
    const [cart, cartLoading] = useCart(trip?.id)
    const cartItems = useCartItems(trip?.id, cart?.id)
    const sharedCartItems = useSharedWithMe(trip?.id)

    const sharedCartItemsTotal = useMemo(() => {
        return sharedCartItems.reduce((total, item) => {
            return total + item.shared!.otherUserPays
        }, 0)
    }, [sharedCartItems])

    const [adding, setAdding] = useState(false)

    const otherUsers = useOtherUsers()

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
            <p className="my-4 is-size-4">
                Your total: <strong>{currencyFormat(cart?.total + sharedCartItemsTotal)}</strong>
            </p>

            {sharedCartItems.length > 0 && <>
                <p className="is-size-4 mt-4">
                    Items shared with you
                </p>
                <p>
                    These are items that other people are sharing the cost of with you.
                    If you see anything unexpected here, please let Pal know.
                    These items will be added to your invoice.
                </p>
                <p>
                    The prices shown are how much you're paying.
                </p>

                {sharedCartItems.map(item => <CartItemComponent 
                    item={{
                        ...item,
                        price: item.shared!.otherUserPays,
                    }}
                    key={item.id}
                    tripId={trip.id}
                    cartId={cart.id}
                    otherUsers={otherUsers}
                    readOnly
                />)}
                
                <p className="is-size-4 mb-4 mt-5">
                    Your items
                </p>
            </>}

            {cartItems.length === 0 && <CartEmpty />}
            {!adding && <button className="button is-primary" onClick={() => setAdding(true)}>
                Add item
            </button>}
            {adding && <CartEdit
                onDismiss={() => setAdding(false)}
                tripId={trip.id}
                cartId={cart.id}
                otherUsers={otherUsers}
            />}


            {cartItems.map(item => <CartItemComponent
                item={item}
                key={item.id}
                tripId={trip.id}
                cartId={cart.id}
                otherUsers={otherUsers}
            />)}
        </>}
    </div>
}
