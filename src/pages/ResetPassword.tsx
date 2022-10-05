import ActionContainer from "../components/Action"
import Input from "../components/Input"
import { FormEvent, useCallback, useState } from "react"
import { getAuth, sendPasswordResetEmail } from "firebase/auth"
import Error from "../components/Error"

export default function ResetPassword() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string>()
    const [done, setDone] = useState(false)

    const submit = useCallback(async (e: FormEvent) => {
        e.preventDefault()
        const auth = getAuth()
        setLoading(true)
        setError(undefined)
        try {
            await sendPasswordResetEmail(auth, email)
            setDone(true)
        } catch (e) {
            setError("That didn't work! Maybe the email doesn't exist?")
        }
        setLoading(false)
    }, [email])

    return <ActionContainer>
        {done && <>
            <p>Done! We sent you a message with a link to continue.</p>
        </>}
        {!done && <>
            <p className="mb-2">
                To reset your password, we'll send a message to your email address.
            </p>

            <form onSubmit={submit}>
                <Input
                    label="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    type="email"
                    disabled={loading}
                    required
                />

                <Error text={error} />

                <button className="button" disabled={loading}>
                    Submit
                </button>
            </form>
        </>}
    </ActionContainer>
}
