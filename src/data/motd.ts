import { useEffect, useState } from "react"
import axios from "axios"

export const useMotD = () => {
    const [motd, setMotd] = useState<string>()

    useEffect(() => {
        const url = process.env.REACT_APP_MOTD_URL
        if (url === undefined) {
            console.warn("No URL for the MotD service has been set.")
            return
        }

        (async () => {
            const response = await axios.get<{
                available: boolean
                motd?: string
            }>(url)
            const data = response.data
            if (!data.available || !data.motd) {
                setMotd(undefined)
                return
            }

            setMotd(data.motd)
        })()
    }, [])

    return motd
}
