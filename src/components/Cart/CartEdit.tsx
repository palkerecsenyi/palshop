import { addToCart, CartItem, updateCartItem } from "../../data/cart"
import { FormEvent, useCallback, useMemo, useState } from "react"
import Input from "../Input"
import { WithId } from "../../data/types"
import { Timestamp, deleteField } from "firebase/firestore"
import Select from "../Select"
import { ShopMetadata } from "../../data/shops"
import { useOtherUsersContext } from "../../data/sharing"

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
    const [showSharePrompt, setShowSharePrompt] = useState(!!initialItem?.shared)
    const [shareDetails, setShareDetails] = useState(initialItem?.shared ? {
        otherUserId: initialItem.shared.otherUserId,
        otherUserPays: (initialItem.shared.otherUserPays / 100).toString()
    } : {
        otherUserId: "",
        otherUserPays: "0",
    })
    const [shop, setShop] = useState(initialItem?.shopId || "")

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

        if (showSharePrompt && shareDetails.otherUserId !== "" && shareDetails.otherUserPays !== "0") {
            const parsedSharedPrice = parseFloat(shareDetails.otherUserPays) * 100
            if (isNaN(parsedSharedPrice)) return

            item.shared = {
                otherUserId: shareDetails.otherUserId,
                otherUserPays: parsedSharedPrice,
            }
        }

        // If the user has unticked the button, make sure the field gets deleted
        // Only works on updates not new items
        if (!showSharePrompt && initialItem) {
            // @ts-ignore
            item.shared = deleteField()
        }

        setLoading(true)
        if (!initialItem) {
            item.createdAt = Timestamp.now()
            item.tripId = tripId
            await addToCart(tripId, cartId, item as CartItem)
        } else {
            await updateCartItem(tripId, cartId, initialItem.id, item)
        }
        onDismiss()
        setLoading(false)
    }, [initialItem, onDismiss, tripId, cartId, name, quantity, price, shop, shareDetails.otherUserId, shareDetails.otherUserPays, showSharePrompt])

    const priceHelpText = useMemo(() => {
        let baseText = "Use the total price (not per unit) to account for multi-buy offers (etc)."
        if (showSharePrompt) {
            baseText += " This is the price you pay (exclude the price the other person is paying)."
        }
        return baseText
    }, [showSharePrompt])

    const selectedShop = useMemo(() => {
        return shops.find(e => e.id === shop)
    }, [shops, shop])

    const otherUsers = useOtherUsersContext()

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
                help={priceHelpText}
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

            <Input
                label="Share price with another person"
                type="checkbox"
                value="showPrompt"
                checked={showSharePrompt}
                onChange={e => setShowSharePrompt(e.target.checked)}
                disabled={loading}
            />

            {showSharePrompt && <div className="box">
                <Select
                    label="Person to share price with"
                    value={shareDetails.otherUserId}
                    onChange={(e) => setShareDetails({...shareDetails, otherUserId: e.target.value})}
                    options={otherUsers.map(e => [e.id, e.name])}
                />
                <Input
                    label="Amount other person should pay"
                    help="The total final amount the other person is contributing to this item. Same as the other price field, enter the total (not per-unit) price."
                    type="text"
                    leftIcon="£"
                    value={shareDetails.otherUserPays}
                    onChange={e => setShareDetails({...shareDetails, otherUserPays: e.target.value})}
                    disabled={loading}
                />
            </div>}

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
