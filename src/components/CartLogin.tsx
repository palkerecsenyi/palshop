import { useHttpsCallable } from "react-firebase-hooks/functions"
import { getFunctions } from "firebase/functions"
import { useEffect, useState } from "react"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"
import Input from "./Input"

export default function CartLogin() {
    const [func] = useHttpsCallable<
        { token: string }, { email: string, password: string }
    >
    (getFunctions(undefined, "europe-west2"), "getCartLogin")

    const [user] = useAuthState(getAuth())
    const [credentials, setCredentials] = useState<{
        email: string,
        password: string
    }>()
    useEffect(() => {
        if (!user) return
        (async () => {
            const token = await user.getIdToken()
            const response = await func({
                token,
            })
            if (!response) return
            setCredentials(response.data)
        })()
    }, [user])

    if (!credentials) {
        return <p>
            Loading...
        </p>
    }

    return <div>
        <Input
            label="Email"
            value={credentials.email}
            readOnly
        />
        <Input
            label="Password"
            value={credentials.password}
            readOnly
        />
    </div>
}
