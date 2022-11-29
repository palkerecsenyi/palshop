import * as functions from "firebase-functions";
import { initializeApp } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import Stripe from "stripe"
import { getCustomer, verifyRequest } from "./util"
import {getAuth} from "firebase-admin/auth";

const stripe = new Stripe(functions.config().stripe.key, {
    apiVersion: '2022-11-15',
})

initializeApp()

const regionalFunctions = functions.region("europe-west2")

type Price = {
    itemId: string
    cartId: string
    userId: string
    primary: boolean
    price: number
}
export const updatePrimaryPrice = regionalFunctions.firestore
    .document("trips/{trip}/carts/{cart}/items/{item}")
    .onWrite(async (change, context) => {
        const firestore = getFirestore()
        const tripId = context.params["trip"]
        const cartId = context.params["cart"]
        const itemId = context.params["item"]
        const primaryPriceRef = firestore
            .collection("trips")
            .doc(tripId)
            .collection("prices")
            .doc(itemId)

        if (!change.after.exists) {
            await primaryPriceRef.delete()

            await firestore.runTransaction(async transaction => {
                const response = await transaction.get(primaryPriceRef.parent
                    .where("itemId", "==", itemId)
                    .where("cartId", "==", cartId)
                    .where("primary", "==", false))

                for (const doc of response.docs) {
                    await transaction.delete(doc.ref)
                }
            })

            return
        }

        const cartResponse = await primaryPriceRef.parent.parent!
            .collection("carts")
            .doc(cartId)
            .get()

        const cart = cartResponse.data() as {owner: string} | undefined
        if (!cart) return

        const item = change.after.data() as {price: number} | undefined
        if (!item) return

        const price: Price = {
            itemId,
            cartId,
            userId: cart.owner,
            primary: true,
            // make sure price is not a float
            price: Math.round(item.price),
        }
        await primaryPriceRef.set(price)
    })

export const getDetails = regionalFunctions.https
    .onCall(async (data: any, context) => {
        const userId = await verifyRequest(context)
        const customer = await getCustomer(userId)

        const stripeCustomer = await stripe.customers.retrieve(
            customer.customerId,
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
    cartId: string
    tripId: string
}
export const getCartInvoiceStatus = regionalFunctions.https
    .onCall(async (data: Partial<getCartInvoiceStatusRequest>, context) => {
        const userId = await verifyRequest(context)
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
        const userId = await verifyRequest(context)
        const auth = getAuth()
        const users = await auth.listUsers()

        const filteredUsers = users.users.filter(e => {
            const customClaims = (e.customClaims || {}) as {shareable?: boolean}
            return e.uid !== userId && customClaims["shareable"] === true
        })

        return filteredUsers.map(e => ({
            name: e.displayName,
            id: e.uid,
        }))
    })

export const getBillingPortalLink = regionalFunctions.https
    .onCall(async (data, context) => {
        const userId = await verifyRequest(context)
        const customer = await getCustomer(userId)
        const session = await stripe.billingPortal.sessions.create({
            customer: customer.customerId,
            return_url: "https://shop.palk.me/account",
        })
        return {
            link: session.url,
        }
    })
