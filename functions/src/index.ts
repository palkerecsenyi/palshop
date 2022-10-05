import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

initializeApp()

type CartItemPrimitive = {
    price: number
}

const regionalFunctions = functions.region("europe-west2")
export const updateCartTotal = regionalFunctions.firestore
    .document("trips/{trip}/carts/{cart}/items/{item}")
    .onWrite(async (change, context) => {
        const cartId = context.params["cart"] as string
        const tripId = context.params["trip"] as string

        const firestore = getFirestore()
        const allItemsResponse = await firestore
            .collection("trips")
            .doc(tripId)
            .collection("carts")
            .doc(cartId)
            .collection("items")
            .get()
        const allItems = allItemsResponse.docs.map(e => e.data() as CartItemPrimitive)
        const itemsTotal = allItems.reduce((total, item) => total + item.price, 0)

        await firestore
            .collection("trips")
            .doc(tripId)
            .collection("carts")
            .doc(cartId)
            .update({
                total: itemsTotal,
            })
    })
