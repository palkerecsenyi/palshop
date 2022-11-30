import PageContainer from "../components/PageContainer"
import HomeLink from "../components/HomeLink"
import { setAccountSetting, useMyAccountSettings } from "../data/account"
import Input from "../components/Input"
import { useAuth } from "../data/util"
import { useAuthState } from "react-firebase-hooks/auth"
import React from "react"
import { Link } from "react-router-dom"

export default function AccountSettings() {
    const [settings, settingsLoading] = useMyAccountSettings()
    const auth = useAuth()
    const [authState] = useAuthState(auth)

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

                {settings.autoCharge ? <p>
                    <strong>
                        You must first <Link to="/account/payment-method">configure a default card</Link>.
                    </strong>
                    &nbsp;Your default payment card will be charged automatically when an invoice is created.
                    If this fails for any reason (e.g. you haven't set a default card), you'll be emailed an invoice
                    as usual.
                </p> : <p>
                    You'll need to manually pay your invoices every time. An invoice will be emailed to you where you
                    can enter your payment details.
                </p>}
            </div>
        </div>}
    </PageContainer>
}
