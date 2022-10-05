import { CartItem, deleteCartItem } from "../../data/cart"
import { currencyFormat } from "../../data/util"
import { useCallback, useState } from "react"
import CartEdit from "./CartEdit"
import { WithId } from "../../data/types"

type props = {
    item: WithId<CartItem>
    tripId: string
    cartId: string
}
export default function CartItemComponent(
    {item, tripId, cartId}: props
) {
    const [editing, setEditing] = useState(false)

    const deleteMe = useCallback(async () => {
        await deleteCartItem(tripId, cartId, item.id)
    }, [item.id, tripId, cartId])

    if (editing) {
        return <div className="my-4">
            <CartEdit
                onDismiss={() => setEditing(false)}
                tripId={tripId}
                cartId={cartId}
                initialItem={item}
            />
        </div>
    }

    return <div className="box my-4">
        <p className="is-size-5">
            {item.name} <span className="has-text-grey">({item.quantity})</span>
        </p>
        <p>
            {currencyFormat(item.price)}
        </p>

        <div className="buttons mt-2">
            <button className="button" onClick={() => setEditing(true)}>
                Edit
            </button>
            <button className="button" onClick={deleteMe}>
                Delete
            </button>
        </div>
    </div>
}
