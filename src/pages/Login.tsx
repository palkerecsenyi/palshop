import Input from "../components/Input"
import { FormEvent, useCallback, useState } from "react"
import { getAuth, signInWithEmailAndPassword } from "firebase/auth"
import Error from "../components/Error"
import { Link, useNavigate } from "react-router-dom"
import ActionContainer from "../components/Action"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string>()
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const submit = useCallback(async (e: FormEvent) => {
        e.preventDefault()
        const auth = getAuth()

        setLoading(true)
        setError(undefined)
        try {
            await signInWithEmailAndPassword(auth, email, password)
            navigate("/")
        } catch (e) {
            setError("That didn't work! Are you sure the email/password is valid?")
        }
        setLoading(false)
    }, [email, password, navigate])

    return <ActionContainer>
        <form onSubmit={submit}>
            <Input
                label="Email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
                required
            />
            <Input
                label="Password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                required
            />

            <Error text={error} />

            <button className="button" disabled={loading}>
                Submit
            </button>

            <p className="has-text-grey mt-2">
                Forgot your password? <Link to="/auth/reset">Reset it here.</Link>
            </p>
        </form>
    </ActionContainer>
}
