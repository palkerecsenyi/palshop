import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"
import Stripe from "stripe"

const stripe = new Stripe(functions.config().stripe.key, {
    apiVersion: '2022-08-01',
})

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

type getDetailsRequest = {
    token: string
}
export const getDetails = regionalFunctions.https
    .onCall(async (data: Partial<getDetailsRequest>, context) => {
        if (context.app === undefined) {
            throw new functions.https.HttpsError(
                'failed-precondition',
                'The function must be called from an App Check verified app'
            )
        }

        if (!data.token) {
            throw new functions.https.HttpsError('permission-denied', 'Token must be provided')
        }

        const auth = getAuth()
        let userId: string
        try {
            const user = await auth.verifyIdToken(data.token)
            userId = user.uid
        } catch (e) {
            throw new functions.https.HttpsError('permission-denied', 'Invalid token')
        }

        const firestore = getFirestore()
        const customer = await firestore.collection('customers').doc(userId).get()
        const customerData = customer.data()
        if (!customerData) {
            throw new functions.https.HttpsError('internal', 'No customer found')
        }

        const stripeCustomer = await stripe.customers.retrieve(
            customerData.customerId,
            {
                expand: ["invoice_credit_balance"]
            }
        )
        if (stripeCustomer.deleted) {
            throw new functions.https.HttpsError('internal', 'Stripe customer does not exist')
        }

        const balance = stripeCustomer.invoice_credit_balance?.gbp ?? 0

        return {
            balance,
            email: stripeCustomer.email,
        }
    })
