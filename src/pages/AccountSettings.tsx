import PageContainer from "../components/PageContainer"
import HomeLink from "../components/HomeLink"
import { getBillingPortalLink, setAccountSetting, useMyAccountSettings } from "../data/account"
import Input from "../components/Input"
import { useAuth } from "../data/util"
import { useAuthState } from "react-firebase-hooks/auth"
import { useCallback, useState } from "react"

export default function AccountSettings() {
    const [settings, settingsLoading] = useMyAccountSettings()
    const auth = useAuth()
    const [authState] = useAuthState(auth)

    const [viewLoading, setViewLoading] = useState(false)
    const viewDashboard = useCallback(async () => {
        setViewLoading(true)
        const { link } = await getBillingPortalLink()
        window.location.href = link
    }, [])

    if (!authState) {
        return <></>
    }

    const userId = authState?.uid
    return <PageContainer>
        <HomeLink />

        <h1 className="title">
            Account settings
        </h1>

        <div className="block">
            <p>
                These settings are saved automatically when you check/uncheck them.
            </p>

            <p>
                You can find some more settings on your payment dashboard. Click the button below to access it.
            </p>

            <button
                onClick={viewDashboard}
                disabled={viewLoading}
                className="button is-primary mt-4"
            >
                {viewLoading ? "Please wait..." : "View payment dashboard"}
            </button>
        </div>

        {settingsLoading && <p>
            Loading...
        </p>}

        {!settingsLoading && <div className="content">
            <div className="box">
                <Input
                    type="checkbox"
                    label="Charge card on file automatically"
                    checked={settings.autoCharge}
                    onChange={(e) => setAccountSetting(userId, "autoCharge", e.target.checked)}
                />

                <p>
                    {
                        settings.autoCharge ?
                            "Your default payment card will be charged automatically when an invoice is created. You can configure this card through your payment dashboard."
                            : "You'll need to manually pay your invoices every time."
                    }
                </p>
            </div>
        </div>}
    </PageContainer>
}
