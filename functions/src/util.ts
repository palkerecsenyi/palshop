import * as functions from "firebase-functions"
import { getAuth } from "firebase-admin/auth"

export const verifyRequest = async (data: { token?: string }, context: functions.https.CallableContext) => {
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

    return userId
}
