import { getCustomer, regionalFunctions, stripe, verifyRequest } from "./util"
import * as functions from "firebase-functions"

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

export const listPaymentMethods = regionalFunctions.https
    .onCall(async (data, context) => {
        const userId = await verifyRequest(context)
        const customer = await getCustomer(userId)
        const paymentMethods = await stripe.customers.listPaymentMethods(
            customer.customerId,
            {type: "card"},
        )

        const stripeCustomer = await stripe.customers.retrieve(customer.customerId)
        if (stripeCustomer.deleted) {
            throw new functions.https.HttpsError("failed-precondition", "Stripe customer was deleted")
        }

        const defaultPaymentMethod = stripeCustomer.invoice_settings.default_payment_method as string | null

        const uniqueCards = paymentMethods.data.filter(method => {
            const card = method.card
            if (!card) return false
            const othersExist = paymentMethods.data.some(e => {
                return e.id !== method.id &&
                    e.card?.fingerprint === card.fingerprint &&
                    e.created > method.created
            })
            return !othersExist
        })

        const paymentMethodList = uniqueCards.map(e => {
            const card = e.card!
            return {
                id: e.id,
                last4: card.last4,
                brand: card.brand,
            }
        })

        return {
            defaultPaymentMethod,
            paymentMethodList,
        }
    })


type setupPaymentMethodRequest = {
    id: string
}
export const setupPaymentMethod = regionalFunctions.https
    .onCall(async (data: Partial<setupPaymentMethodRequest>, context) => {
        if (!data.id) {
            throw new functions.https.HttpsError("invalid-argument", "PaymentMethod ID must be specified")
        }

        const userId = await verifyRequest(context)
        const customer = await getCustomer(userId)

        await stripe.customers.update(customer.customerId, {
            invoice_settings: {
                default_payment_method: data.id,
            }
        })

        const setupIntent = await stripe.setupIntents.create({
            payment_method: data.id,
            customer: customer.customerId,
            confirm: true,
            usage: "off_session",
            return_url: "https://shop.palk.me/account/payment-method",
        })

        return {
            setupIntentClientSecret: setupIntent.client_secret,
        }
    })
