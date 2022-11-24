import { CartItem, deleteCartItem } from "../../data/cart"
import { currencyFormat } from "../../data/util"
import { useCallback, useMemo, useState } from "react"
import CartEdit from "./CartEdit"
import { WithId } from "../../data/types"
import { ShopMetadata } from "../../data/shops"

type props = {
    item: WithId<CartItem>
    tripId: string
    cartId: string
    shops: WithId<ShopMetadata>[]
    readOnly?: boolean
}
export default function CartItemComponent(
    {item, tripId, cartId, shops, readOnly}: props
) {
    const [editing, setEditing] = useState(false)

    const deleteMe = useCallback(async () => {
        await deleteCartItem(tripId, cartId, item.id)
    }, [item.id, tripId, cartId])

    const shop = useMemo(() => {
        return shops.find(e => e.id === item.shopId)
    }, [item.shopId, shops])

    if (editing) {
        return <div className="my-4">
            <CartEdit
                onDismiss={() => setEditing(false)}
                tripId={tripId}
                cartId={cartId}
                initialItem={item}
                shops={shops}
            />
        </div>
    }

    return <div className="box my-4">
        <p className="is-size-5">
            {item.name}
            <span className="has-text-grey">
                &nbsp;({item.quantity}) from {shop?.name}
            </span>
        </p>
        <p>
            {currencyFormat(item.price)}
        </p>

        {!readOnly &&
            <div className="buttons mt-2">
                <button className="button" onClick={() => setEditing(true)}>
                    Edit
                </button>
                <button className="button" onClick={deleteMe}>
                    Delete
                </button>
            </div>
        }
    </div>
}
