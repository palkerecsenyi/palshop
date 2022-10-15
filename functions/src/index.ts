import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import Stripe from "stripe"
import { verifyRequest } from "./util"
import {getAuth} from "firebase-admin/auth";

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
        const userId = await verifyRequest(data, context)

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

type getCartInvoiceStatusRequest = {
    token: string
    cartId: string
    tripId: string
}
export const getCartInvoiceStatus = regionalFunctions.https
    .onCall(async (data: Partial<getCartInvoiceStatusRequest>, context) => {
        const userId = await verifyRequest(data, context)
        if (!data.cartId || !data.tripId) {
            throw new functions.https.HttpsError('invalid-argument', 'Missing cart/trip ID')
        }

        const firestore = getFirestore()
        const cart = await firestore.collection('trips')
            .doc(data.tripId)
            .collection('carts')
            .doc(data.cartId)
            .get()

        const cartData = cart.data() as Partial<{
            invoiceId: string,
            owner: string
        }>

        if (!cartData || !cartData.invoiceId || !cartData.owner) {
            throw new functions.https.HttpsError('failed-precondition', 'Cart does not exist or has no invoice')
        }

        if (cartData.owner !== userId) {
            throw new functions.https.HttpsError('permission-denied', 'User does not own this cart')
        }

        const invoice = await stripe.invoices.retrieve(cartData.invoiceId)
        if (invoice.status === 'draft') {
            throw new functions.https.HttpsError('failed-precondition', 'Invoice is not finalized')
        }

        return {
            isPaid: invoice.status !== 'open',
            total: invoice.amount_due,
            number: invoice.number,
            link: invoice.hosted_invoice_url,
        }
    })

type getOtherUserListRequest = {
    token: string
} 
export const getOtherUserList = regionalFunctions.https
    .onCall(async (data: Partial<getOtherUserListRequest>, context) => {
        const userId = await verifyRequest(data, context)
        const auth = getAuth()
        const users = await auth.listUsers()

        const usersWithoutCurrent = users.users.filter(e => {
            return e.uid !== userId
        })

        return usersWithoutCurrent.map(e => ({
            email: e.email,
            id: e.uid,
        }))
    })
