import { createContext, useContext, useEffect, useState } from "react"
import { collection, getDocs, getFirestore } from "firebase/firestore"
import { WithId } from "./types"

export const ShopMetadataContext = createContext<WithId<ShopMetadata>[]>([])
export const useShopMetadataContext = () => useContext(ShopMetadataContext)

export interface ShopMetadata {
    name: string
    deliveryFee: number
}

export const useShopMetadata = () => {
    const [shops, setShops] = useState<WithId<ShopMetadata>[]>([])

    useEffect(() => {
        const firestore = getFirestore()
        ;(async () => {
            const response = await getDocs(collection(firestore, "shops"))
            setShops(response.docs.map(e => ({
                ...e.data() as ShopMetadata,
                id: e.id,
            })))
        })()
    }, [])

    return shops
}
