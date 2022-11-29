import { firestoreConverter, useAuth, useFirestore } from "./util"
import { useDocumentData } from "react-firebase-hooks/firestore"
import { useAuthState } from "react-firebase-hooks/auth"
import { doc, getFirestore, setDoc } from "firebase/firestore"
import { WithId } from "./types"
import { getFunctions, httpsCallable } from "firebase/functions"

export interface AccountSettings {
    autoCharge: boolean
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
    }, loading] as const
}

export const setAccountSetting = async (userId: string, settingName: keyof AccountSettings, value: boolean) => {
    const firestore = getFirestore()
    await setDoc(doc(firestore, "account_settings", userId), {
        [settingName]: value,
    }, {
        merge: true,
    })
}

export const getBillingPortalLink = async () => {
    const functions = getFunctions(undefined, "europe-west2")
    const cloudFunction = httpsCallable<unknown, {link: string}>(functions, "getBillingPortalLink")
    const response = await cloudFunction()
    return response.data
}
