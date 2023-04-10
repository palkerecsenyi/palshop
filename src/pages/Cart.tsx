import { formatTripStatus, TripStatus, useTripSelector } from "../data/trips"
import CartInit from "../components/Cart/CartInit"
import CartEmpty from "../components/Cart/CartEmpty"
import { useMemo, useState } from "react"
import CartEdit from "../components/Cart/CartEdit"
import { currencyFormat } from "../data/util"
import CartItemComponent from "../components/Cart/CartItem"
import CartCopyModal from "../components/Cart/CartCopyModal"
import { useEstimatedTotal } from "../data/total"
import Input from "../components/Input"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCopy, faMagnifyingGlass, faPlus } from "@fortawesome/free-solid-svg-icons"
import { useShopMetadataSelector } from "../data/shops"
import CartSharedWithMe from "../components/Cart/SharedList/CartSharedWithMe"
import PageContainer from "../components/PageContainer"
import HomeLink from "../components/HomeLink"
import MotD from "../components/MotD"
import TripCountdown from "../components/TripCountdown"
import { useAppSelector } from "../stores/hooks"

export default function Cart() {
    const trip = useTripSelector()
    const {cart, cartLoading, cartItems, allPrices} = useAppSelector(state => state.tripsReducer)

    const [adding, setAdding] = useState(false)
    const [showCopyModal, setShowCopyModal] = useState(false)

    const [estimatedTotal, total] = useEstimatedTotal(cartItems, allPrices)
    const shops = useShopMetadataSelector()

    const [searchQuery, setSearchQuery] = useState("")
    const searchResults = useMemo(() => {
        const normalisedQuery = searchQuery.toLowerCase()
        return cartItems.filter(item => {
            return item.name.toLowerCase().includes(normalisedQuery) || item.id === searchQuery
        })
    }, [searchQuery, cartItems])

    if (!trip) {
        return <></>
    }

    if (trip.status !== TripStatus.AcceptingOrders) {
        return <PageContainer>
            <HomeLink />

            <h1 className="title">
                Trip closed :(
            </h1>

            <p className="is-size-4">
                Unfortunately, this trip is closed and not accepting any more orders. At the moment, it's {formatTripStatus(trip.status)}.
            </p>
        </PageContainer>
    }

    return <PageContainer>
        <HomeLink />

        <h1 className="title">
            My shopping cart
        </h1>

        {!cart && !cartLoading && <CartInit />}

        {cart && <>
            <TripCountdown />
            <MotD />

            <p className={`${total > 0 ? 'mt-4' : 'my-4'} is-size-4`}>
                Your total: <strong>{currencyFormat(total)}</strong>
            </p>
            {total > 0 && <p className="mb-4 has-text-grey">
                + fees of about {currencyFormat(estimatedTotal - total)}
            </p>}

            <CartSharedWithMe
                tripId={trip.id}
                cartId={cart.id}
            />

            {cartItems.length === 0 && <CartEmpty />}

            <div className="field is-grouped">
                {!adding && <p className="control">
                   <button className="button is-primary" onClick={() => setAdding(true)}>
                       <FontAwesomeIcon icon={faPlus} />
                       &nbsp; Add item
                   </button>
                </p>}
                <p className="control">
                   <button className="button" onClick={() => setShowCopyModal(true)}>
                       <FontAwesomeIcon icon={faCopy} />
                       &nbsp; Copy cart
                   </button>
                </p>
            </div>

            {showCopyModal && <CartCopyModal
                tripId={trip.id}
                cartId={cart.id}
                close={() => setShowCopyModal(false)}
            />}

            {adding && <CartEdit
                onDismiss={() => setAdding(false)}
                tripId={trip.id}
                cartId={cart.id}
                shops={shops}
            />}

            {cartItems.length > 0 && <Input
                leftIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                placeholder="Search cart..."
                onChange={e => setSearchQuery(e.target.value)}
                value={searchQuery}
            />}

            {searchResults.map(item => <CartItemComponent
                item={item}
                key={item.id}
                tripId={trip.id}
                cartId={cart.id}
                shops={shops}
            />)}
        </>}
    </PageContainer>
}
