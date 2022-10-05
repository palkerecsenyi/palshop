import { addToCart, CartItem, updateCartItem } from "../../data/cart"
import { FormEvent, useCallback, useState } from "react"
import Input from "../Input"
import { WithId } from "../../data/types"

type props = {
    initialItem?: WithId<CartItem>
    onDismiss(): void
    tripId: string
    cartId: string
}
export default function CartEdit(
    {initialItem, onDismiss, tripId, cartId}: props
) {
    const [name, setName] = useState(initialItem?.name || "")
    const [quantity, setQuantity] = useState(initialItem?.quantity || 0)
    const [price, setPrice] = useState(initialItem?.price ? (initialItem.price / 100).toString() : "")

    const [loading, setLoading] = useState(false)

    const submit = useCallback(async (e: FormEvent) => {
        e.preventDefault()
        if (!name || !quantity || !price) return

        const parsedPrice = parseFloat(price) * 100
        if (isNaN(parsedPrice)) return

        setLoading(true)
        if (!initialItem) {
            await addToCart(tripId, cartId, {
                name,
                quantity,
                price: parsedPrice,
            })
        } else {
            await updateCartItem(tripId, cartId, initialItem.id, {
                name,
                quantity,
                price: parsedPrice,
            })
        }
        onDismiss()
        setLoading(false)
    }, [initialItem, onDismiss, tripId, cartId, name, quantity, price])

    return <div className="box">
        <form onSubmit={submit}>
            <Input
                label="Item name"
                help="Please try to be specific to reduce confusion between similar items."
                placeholder="Enter a description of the item..."
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                disabled={loading}
                required
            />
            <Input
                label="Quantity"
                placeholder="Enter how many of this item you added..."
                type="number"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value))}
                disabled={loading}
                required
            />
            <Input
                label="Price"
                placeholder="Enter the total price..."
                help="Use the total price (not per unit) to account for multi-buy offers (etc)."
                type="text"
                leftIcon="£"
                value={price}
                onChange={e => setPrice(e.target.value)}
                disabled={loading}
                required
            />

            <div className="buttons">
                <button type="submit" disabled={loading} className="button is-primary">
                    Save
                </button>
                <button className="button" disabled={loading} onClick={onDismiss}>
                    Cancel
                </button>
            </div>
        </form>
    </div>
}
