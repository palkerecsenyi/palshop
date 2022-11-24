import { CartItem, setCartItem} from "../../data/cart"
import { FormEvent, useCallback, useMemo, useState } from "react"
import Input from "../Input"
import { WithId } from "../../data/types"
import { Timestamp } from "firebase/firestore"
import Select from "../Select"
import { ShopMetadata } from "../../data/shops"
import CartShareModal from "./Share/CartShareModal"
import {v4 as uuid} from "uuid"

type props = {
    initialItem?: WithId<CartItem>
    onDismiss(): void
    tripId: string
    cartId: string
    shops: WithId<ShopMetadata>[]
}
export default function CartEdit(
    {initialItem, onDismiss, tripId, cartId, shops}: props
) {
    const [name, setName] = useState(initialItem?.name || "")
    const [quantity, setQuantity] = useState(initialItem?.quantity || 0)
    const [price, setPrice] = useState(initialItem?.price ? (initialItem.price / 100).toString() : "")
    const [shop, setShop] = useState(initialItem?.shopId || "")
    const [id] = useState(initialItem?.id || uuid())

    const [loading, setLoading] = useState(false)

    const submit = useCallback(async (e: FormEvent) => {
        e.preventDefault()
        if (!name || !quantity || !price || !shop) return

        const parsedPrice = parseFloat(price) * 100
        if (isNaN(parsedPrice)) return

        const item: Partial<CartItem> = {
            name,
            quantity,
            price: parsedPrice,
            shopId: shop,
        }

        setLoading(true)
        if (!initialItem) {
            item.createdAt = Timestamp.now()
            item.tripId = tripId
        }
        await setCartItem(tripId, cartId, id, item)

        onDismiss()
        setLoading(false)
    }, [initialItem, onDismiss, tripId, cartId, name, quantity, price, shop, id])

    const selectedShop = useMemo(() => {
        return shops.find(e => e.id === shop)
    }, [shops, shop])

    const [showShareModal, setShowShareModal] = useState(false)
    const shareModalButtonClick = useCallback((e: FormEvent) => {
        e.preventDefault()
        setShowShareModal(true)
    }, [])

    return <div className="box">
        <form onSubmit={submit}>
            <Input
                label="Item name"
                help={`Please copy the exact item name from the ${selectedShop?.name || 'shop'} website.`}
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

            <Select
                label="Which shop is this item from?"
                options={shops.map(e => [e.id, e.name])}
                help="You'll get charged the respective delivery fee for each shop even for a single item."
                value={shop}
                onChange={(e) => setShop(e.target.value)}
            />

            <button
                className="button mb-4"
                onClick={shareModalButtonClick}
            >
                Share price
            </button>

            {showShareModal && <CartShareModal
                close={() => setShowShareModal(false)}
                tripId={tripId}
                cartId={cartId}
                itemId={id}
            />}

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
