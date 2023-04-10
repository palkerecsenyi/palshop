import { WithId } from "../../../data/types"
import { Price, usePriceItem } from "../../../data/price"
import CartItemComponent from "../CartItem"
import { useShopMetadataSelector } from "../../../data/shops"
import { useMemo } from "react"
import { CartItem } from "../../../data/cart"

type props = {
    tripId: string
    cartId: string
    price: WithId<Price>
}
export default function CartSharedWithMeItem(
    {tripId, cartId, price}: props
) {
    const item = usePriceItem(tripId, price)
    const shops = useShopMetadataSelector()

    const modifiedItem = useMemo(() => {
        return {
            ...item,
            price: price.price,
        } as WithId<CartItem>
    }, [item, price.price])

    if (!item) {
        return <div className="box my-4">
            <p>
                Loading...
            </p>
        </div>
    }

    return <CartItemComponent
        item={modifiedItem}
        tripId={tripId}
        cartId={cartId}
        shops={shops}
        readOnly
    />
}
