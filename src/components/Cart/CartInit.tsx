import { useCallback, useMemo, useState } from "react"
import { useTripSelector } from "../../data/trips"
import { useAuthState } from "react-firebase-hooks/auth"
import { getAuth } from "firebase/auth"
import { createCart } from "../../data/cart"
import { ReactMarkdown } from "react-markdown/lib/react-markdown"
import markdownStyles from "../../styles/markdown.module.scss"
import { Buffer } from "buffer"
import Input from "../Input"

export default function CartInit() {
    const [loading, setLoading] = useState(false)
    const trip = useTripSelector()
    const [authState] = useAuthState(getAuth())
    const submit = useCallback(async () => {
        if (!trip || !authState) return
        setLoading(true)
        await createCart(trip.id, authState.uid)
    }, [trip, authState])

    const text = useMemo(() => {
        const rawText = process.env.REACT_APP_CART_INIT
        if (!rawText) return undefined

        return Buffer.from(rawText, "base64").toString("utf8")
    }, [])

    const [accepted, setAccepted] = useState(false)

    const buttonDisabled = loading || (text !== undefined && !accepted)

    return <article className="message is-info">
        <div className="message-header">
            <p>Welcome!</p>
        </div>
        <div className={`message-body content ${markdownStyles.markdownMessageContainer}`}>
            {text ? <>
                <ReactMarkdown>
                    {text}
                </ReactMarkdown>

                <Input 
                    type="checkbox"
                    checked={accepted}
                    onChange={e => setAccepted(e.target.checked)}
                    label="I have read the message and accept the terms & conditions"
                />
            </>: <>
                <p>
                    To start your order, click the button below.
                </p>
            </>}

            <button
                onClick={submit} 
                className="button" 
                disabled={buttonDisabled}
            >
                Start shopping
            </button>
        </div>
    </article>
}
