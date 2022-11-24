import { usePricesSharedWithMeContext } from "../../../data/price"
import CartSharedWithMeItem from "./CartSharedWithMeItem"

type props = {
    tripId: string
    cartId: string
}
export default function CartSharedWithMe(
    {tripId, cartId}: props
) {
    const pricesSharedWithMe = usePricesSharedWithMeContext()

    if (pricesSharedWithMe.length === 0) {
        return <></>
    }

    return <>
        <p className="is-size-4">
            Shared with me
        </p>

        <p>
            Other users have shared the price of these items with you. If you see anything you didn't agree to,
            please let Pal know.
        </p>
        <p>
            The prices shown are what you're paying.
        </p>

        {pricesSharedWithMe.map(price => <CartSharedWithMeItem
            price={price}
            key={price.id}
            tripId={tripId}
            cartId={cartId}
        />)}

        <p className="is-size-4 my-2">
            Your items
        </p>
    </>
}
