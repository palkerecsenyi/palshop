import { WithId } from "./types"
import { CartItem } from "./cart"
import { useShopMetadataContext } from "./shops"
import { useMemo } from "react"

export const useEstimatedTotal = (cartItems: WithId<CartItem>[], sharedCartTotal: number) => {
    const shops = useShopMetadataContext()

    return useMemo(() => {
        const shopsUsed: string[] = []
        let total = 0
        for (const item of cartItems) {
            total += item.price;
            if (!shopsUsed.includes(item.shopId)) {
                shopsUsed.push(item.shopId)
            }
        }

        total += sharedCartTotal
        let deliveryFees = 0

        for (const shopId of shopsUsed) {
            const shop = shops.find(e => e.id === shopId)
            if (!shop) continue
            deliveryFees += shop.deliveryFee
        }

        // Stripe processing fee for UK cards
        const processingFee = (total / 100) * 1.8 + 20
        return [total + processingFee + deliveryFees, total] as const
    }, [shops, cartItems, sharedCartTotal])
}
