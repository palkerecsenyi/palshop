import * as functions from "firebase-functions"
import { getFirestore } from "firebase-admin/firestore"

export const verifyRequest = async (context: functions.https.CallableContext) => {
    if (context.app === undefined) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'The function must be called from an App Check verified app'
        )
    }

    if (context.auth?.token === undefined) {
        throw new functions.https.HttpsError('permission-denied', 'Valid token must be provided')
    }

    return context.auth.token.uid
}

export const getCustomer = async (userId: string) => {
    const firestore = getFirestore()
    const customer = await firestore.collection('customers').doc(userId).get()
    const customerData = customer.data()
    if (!customerData) {
        throw new functions.https.HttpsError('internal', 'No customer found')
    }

    return customerData as {
        customerId: string
        skip: boolean
    }
}
