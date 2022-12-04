import type { WithId } from "./types"
import type { CartItem } from "./cart"
import { useShopMetadataContext } from "./shops"
import { useMemo } from "react"
import type { Price } from "./price"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"

export const useEstimatedTotal = (cartItems: WithId<CartItem>[], allPrices: WithId<Price>[]) => {
    const shops = useShopMetadataContext()
    const [user] = useAuthState(getAuth())

    return useMemo(() => {
        const shopsUsed: string[] = []
        let total = 0
        for (const item of cartItems) {
            total += item.price;
            if (!shopsUsed.includes(item.shopId)) {
                shopsUsed.push(item.shopId)
            }
        }

        for (const price of allPrices) {
            if (price.primary || price.userId !== user?.uid) continue
            total += price.price
        }

        let deliveryFees = 0

        for (const shopId of shopsUsed) {
            const shop = shops.find(e => e.id === shopId)
            if (!shop) continue
            deliveryFees += shop.deliveryFee
        }

        // Stripe processing fee for UK cards (incl. 0.4% invoice fee)
        const processingFee = (total / 100) * 1.8 + 20
        return [total + processingFee + deliveryFees, total] as const
    }, [shops, cartItems, allPrices, user?.uid])
}
