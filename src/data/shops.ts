import { createContext, useContext } from "react"
import { collection } from "firebase/firestore"
import { WithId } from "./types"
import { firestoreConverter, useFirestore } from "./util"
import { useCollectionDataOnce } from "react-firebase-hooks/firestore"

export const ShopMetadataContext = createContext<WithId<ShopMetadata>[]>([])
export const useShopMetadataContext = () => useContext(ShopMetadataContext)

export interface ShopMetadata {
    name: string
    deliveryFee: number
}
export const ShopConverter = firestoreConverter<ShopMetadata>()

export const useShopMetadata = () => {
    const firestore = useFirestore()
    const [shops] = useCollectionDataOnce(
        collection(firestore, "shops")
            .withConverter(ShopConverter)
    )

    return shops || []
}
