import * as functions from "firebase-functions"

export const verifyRequest = async (context: functions.https.CallableContext) => {
    if (context.app === undefined) {
        throw new functions.https.HttpsError(
            'failed-precondition',
            'The function must be called from an App Check verified app'
        )
    }

    if (context.auth === undefined) {
        throw new functions.https.HttpsError('permission-denied', 'Valid token must be provided')
    }

    return context.auth.token.uid
}
