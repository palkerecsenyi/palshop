import { useOtherUsersContext } from "../../../data/sharing"
import Select from "../../Select"
import { FormEvent, useCallback, useMemo, useState } from "react"
import Input from "../../Input"
import { Price, setPrice as savePrice } from "../../../data/price"
import {v4 as uuid} from "uuid"
import { WithId } from "../../../data/types"

type props = {
    itemId: string
    cartId: string
    tripId: string
    shares: WithId<Price>[]
    done(): void
}
export default function CartShareModalAdd(
    {tripId, done: callback, itemId, cartId, shares}: props
) {
    const otherUsers = useOtherUsersContext()
    const [userId, setUserId] = useState("")
    const [price, setPrice] = useState("")
    const [loading, setLoading] = useState(false)

    const cancel = useCallback((e: FormEvent) => {
        e.preventDefault()
        callback()
    }, [callback])

    const save = useCallback(async (e: FormEvent) => {
        e.preventDefault()
        if (!price || !userId) return

        const parsedPrice = parseFloat(price) * 100
        if (isNaN(parsedPrice)) return

        setLoading(true)
        const priceObject: Price = {
            cartId,
            itemId,
            userId,
            primary: false,
            price: parsedPrice,
        }
        const id = uuid()
        await savePrice(tripId, id, priceObject)
        callback()
    }, [price, userId, itemId, cartId, tripId, callback])

    const unusedOtherUsers = useMemo(() => {
        return otherUsers.filter(user => {
            return !shares.some(share => share.userId === user.id)
        })
    }, [otherUsers, shares])

    return <div className="box">
        <Select
            label="User to share with"
            options={unusedOtherUsers.map(({id, name}) => [id, name])}
            value={userId}
            onChange={e => setUserId(e.target.value)}
            disabled={loading}
            required
        />

        <Input
            label="Price"
            leftIcon="£"
            help="Use the total (not per unit) price this user should pay."
            disabled={loading}
            value={price}
            onChange={e => setPrice(e.target.value)}
            required
        />

        <div className="buttons">
            <button className="button is-primary" onClick={save}>
                Save
            </button>
            <button className="button" onClick={cancel}>
                Cancel
            </button>
        </div>
    </div>
}
