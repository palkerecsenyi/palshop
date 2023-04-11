import PageContainer from "../components/PageContainer"
import { actionSetupIntent, setupPaymentMethod, useCardList } from "../data/account"
import { useCallback, useEffect, useMemo, useState } from "react"
import Select from "../components/Select"
import { stripeCardBrandFormat } from "../data/stripe"
import { Link } from "react-router-dom"
import ErrorComponent from "../components/Error"
import LoadingText from "../components/LoadingText"

export default function AccountCardConfig() {
    const paymentMethodsData = useCardList()
    const [selectedCard, setSelectedCard] = useState("")
    useEffect(() => {
        if (!paymentMethodsData?.defaultPaymentMethod) {
            setSelectedCard("")
            return
        }

        setSelectedCard(paymentMethodsData.defaultPaymentMethod)
    }, [paymentMethodsData?.defaultPaymentMethod])

    const selectOptions = useMemo(() => {
        if (!paymentMethodsData?.paymentMethodList) return []
        return paymentMethodsData.paymentMethodList.map(e => {
            const text = stripeCardBrandFormat(e.brand) + " " + e.last4
            return [e.id, text] as const
        })
    }, [paymentMethodsData?.paymentMethodList])

    const [confirmLoading, setConfirmLoading] = useState(false)
    const [done, setDone] = useState(false)
    const [error, setError] = useState<string>()
    const confirm = useCallback(async () => {
        if (!selectedCard) return

        setConfirmLoading(true)
        setError(undefined)
        setDone(false)
        const response = await setupPaymentMethod(selectedCard)

        try {
            await actionSetupIntent(response.setupIntentClientSecret)
            setDone(true)
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message)
            } else {
                setError("Something went wrong.")
            }
        }

        setConfirmLoading(false)
    }, [selectedCard])

    return <PageContainer>
        <Link to="/account" className="button mb-4">
            Back to account
        </Link>

        <h1 className="title">
            Configure your default payment card
        </h1>

        {!paymentMethodsData && <LoadingText />}
        {paymentMethodsData && <>
            <div className="block">
                <p>
                    If no cards are shown here, it'll be because you've never paid for a PalShop order by card before.
                    You need to make at least one manual payment before you can set up automatic card payment.
                </p>
            </div>

            <div className="block">
                <Select
                    label="Default payment card"
                    options={selectOptions}
                    value={selectedCard}
                    onChange={e => setSelectedCard(e.target.value)}
                    disabled={confirmLoading}
                />

                <button
                    className={`button is-primary ${confirmLoading ? 'is-loading' : ''}`}
                    onClick={confirm}
                    disabled={confirmLoading}
                >
                    Set up & save
                </button>
            </div>

            {confirmLoading && <div className="block">
                <p>
                    Please wait, this may take a couple seconds...
                </p>
            </div>}

            {done && <div className="block">
                <p>
                    Done! Your card has been set up and saved as default.
                </p>
            </div>}
            <ErrorComponent text={error} />
        </>}
    </PageContainer>
}
