import { useEffect, useState } from "react";

export default function LoadingText() {
    const [ellipsis, setEllipsis] = useState("")
    useEffect(() => {
        let _ellipsis = ""
        const interval = setInterval(() => {
            if (_ellipsis.length === 3) {
                _ellipsis = ""
            } else {
                _ellipsis += "."
            }
            setEllipsis(_ellipsis)
        }, 200)

        return () => clearInterval(interval)
    }, [])

    return <p className="is-size-4">
        Loading{ellipsis}
    </p>
}
