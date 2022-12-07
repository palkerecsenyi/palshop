import { firestoreConverter, useAuth, useFirestore, useFunctions } from "./util"
import { useDocumentData } from "react-firebase-hooks/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { doc, getFirestore, setDoc } from "firebase/firestore"
import { WithId } from "./types"
import { getFunctions, httpsCallable } from "firebase/functions"
import { useEffect, useState } from "react"
import { useHttpsCallable } from "react-firebase-hooks/functions"
import { loadStripe } from "@stripe/stripe-js"

export interface AccountSettings {
    autoCharge: boolean
    compensationMethod: "credit" | "refund"
}

export const AccountSettingsConverter = firestoreConverter<AccountSettings>()
export const useMyAccountSettings = (): readonly [WithId<AccountSettings>, boolean] => {
    const firestore = useFirestore()
    const auth = useAuth()
    const [authState] = useAuthState(auth)
    const [settings, loading] = useDocumentData(
        doc(firestore, "account_settings", authState?.uid || "_")
            .withConverter(AccountSettingsConverter)
    )

    return [settings || {
        id: "",
        autoCharge: false,
        compensationMethod: "credit",
    }, loading] as const
}

export const setAccountSetting = async (userId: string, settingName: keyof AccountSettings, value: any) => {
    const firestore = getFirestore()
    await setDoc(doc(firestore, "account_settings", userId), {
        [settingName]: value,
    }, {
        merge: true,
    })
}

export interface CardData {
    id: string
    last4: string
    brand: string
}

export interface PaymentMethodListResponse {
    defaultPaymentMethod: string | null
    paymentMethodList: CardData[]
}

export const useCardList = () => {
    const functions = useFunctions()
    const [data, setData] = useState<PaymentMethodListResponse>()
    const [cloudFunction] = useHttpsCallable<unknown, PaymentMethodListResponse>(functions, "listPaymentMethods")
    useEffect(() => {
        cloudFunction()
            .then(response => {
                if (!response) {
                    setData(undefined)
                    return
                }
                setData(response.data)
            })
    }, [cloudFunction])
    return data
}

export const setupPaymentMethod = async (selectedPaymentMethod: string) => {
    const functions = getFunctions(undefined, "europe-west2")
    const cloudFunction = httpsCallable<
        {id: string},
        {setupIntentClientSecret: string}
    >(functions, "setupPaymentMethod")
    const response = await cloudFunction({
        id: selectedPaymentMethod,
    })
    return response.data
}

export const actionSetupIntent = async (clientSecret: string) => {
    const stripe = await loadStripe(process.env.REACT_APP_STRIPE_KEY as string)
    if (!stripe) {
        throw new Error("Stripe failed to load.")
    }
    const setupIntentResponse = await stripe.retrieveSetupIntent(clientSecret)
    const { setupIntent } = setupIntentResponse
    if (!setupIntent) {
        throw new Error("Failed to retrieve Setup Intent")
    }

    if (setupIntent.status === "succeeded") {
        return
    }
    const confirmResponse = await stripe.confirmCardSetup(clientSecret)
    if (confirmResponse.error) {
        throw new Error("Failed to confirm your card: " + confirmResponse.error.message)
    }
}
