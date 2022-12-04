import { createContext, useContext, useEffect, useState } from "react"
import { useFunctions } from "./util"
import { useHttpsCallable } from "react-firebase-hooks/functions"

export interface OtherUserDetail {
    id: string
    name: string
}

export const OtherUsersContext = createContext<OtherUserDetail[]>([])
export const useOtherUsersContext = () => useContext(OtherUsersContext)

export const useOtherUsers = () => {
    const [otherUsers, setOtherUsers] = useState<OtherUserDetail[]>([])
    const functions = useFunctions()
    const [callable] = useHttpsCallable<undefined, OtherUserDetail[]>(functions, "getOtherUserList")
    useEffect(() => {
        (async () => {
            const response = await callable()
            if (!response) {
                setOtherUsers([])
                return
            }
            setOtherUsers(response.data)
        })()
    }, [callable])

    return otherUsers
}
