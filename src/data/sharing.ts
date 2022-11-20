import { createContext, useContext, useEffect, useState } from "react"
import { getFunctions, httpsCallable } from "firebase/functions"

export interface OtherUserDetail {
    id: string
    name: string
}

export const OtherUsersContext = createContext<OtherUserDetail[]>([])
export const useOtherUsersContext = () => useContext(OtherUsersContext)

export const useOtherUsers = () => {
    const [otherUsers, setOtherUsers] = useState<OtherUserDetail[]>([])
    useEffect(() => {
        (async () => {
            const functions = getFunctions(undefined, "europe-west2")
            const callable = httpsCallable<{token: string}, OtherUserDetail[]>(functions, "getOtherUserList")
            const response = await callable()

            setOtherUsers(response.data)
        })()
    }, [])

    return otherUsers
}
