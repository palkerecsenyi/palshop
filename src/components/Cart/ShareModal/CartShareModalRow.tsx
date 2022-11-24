import { WithId } from "../../../data/types"
import { deletePrice, Price } from "../../../data/price"
import { useOtherUsersContext } from "../../../data/sharing"
import { FormEvent, useCallback, useMemo, useState } from "react"
import { currencyFormat } from "../../../data/util"

type props = {
    tripId: string
    price: WithId<Price>
}
export default function CartShareModalRow(
    {tripId, price}: props
) {
    const otherUsers = useOtherUsersContext()
    const owner = useMemo(() => {
        return otherUsers.find(e => e.id === price.userId)
    }, [price.userId, otherUsers])

    const [loading, setLoading] = useState(false)
    const deleteShare = useCallback(async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        await deletePrice(tripId, price.id)
    }, [tripId, price.id])

    if (!owner) return <div className="box">
        <p>Loading...</p>
    </div>

    return <div className="box">
        <p>
            {owner.name} pays <strong>{currencyFormat(price.price)}</strong>
        </p>
        <button
            className="button is-danger is-light is-small mt-2"
            onClick={deleteShare}
            disabled={loading}
        >
            Delete
        </button>
    </div>
}
