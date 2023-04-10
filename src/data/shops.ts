import { useEffect } from "react"
import { collection, query, where } from "firebase/firestore"
import { firestoreConverter, useFirestore } from "./util"
import { useCollectionDataOnce } from "react-firebase-hooks/firestore"
import { useAppDispatch, useAppSelector } from "../stores/hooks"
import { updateShops } from "../stores/shops"

export const useShopMetadataSelector = () => useAppSelector(state => state.shopsReducer.shops)

export interface ShopMetadata {
    name: string
    deliveryFee: number
    hidden: boolean
}
export const ShopConverter = firestoreConverter<ShopMetadata>()

export const useShopMetadata = () => {
    const firestore = useFirestore()
    const [shops] = useCollectionDataOnce(query(
        collection(firestore, "shops"),
        where("hidden", "==", false)
    ).withConverter(ShopConverter))

    const dispatch = useAppDispatch()
    useEffect(() => {
        dispatch(updateShops(shops ?? []))
    }, [shops, dispatch])
}
