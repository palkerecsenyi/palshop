import Modal from "../../Modal"
import { useSecondaryPrices } from "../../../data/price"
import CartShareModalRow from "./CartShareModalRow"
import { useState } from "react"
import CartShareModalAdd from "./CartShareModalAdd"

type props = {
    close(): void
    tripId: string
    cartId: string
    itemId: string
}
export default function CartShareModal(
    { close, tripId, cartId, itemId }: props
) {
    const shares = useSecondaryPrices(tripId, cartId, itemId)
    const [adding, setAdding] = useState(false)

    return <Modal
        close={close}
        title="Share item price"
        footer={<>
            {!adding && <div className="buttons">
                <button
                    className="button is-primary"
                    onClick={() => setAdding(true)}
                >
                    Add
                </button>
                <button
                    className="button"
                    onClick={close}
                >
                    Close
                </button>
            </div> }
        </>}
    >
        {shares.map(share => <CartShareModalRow
            price={share}
            key={share.id}
            tripId={tripId}
        />)}

        {shares.length === 0 && !adding && <p>
            Not shared with anyone. Click 'Add' to add your first share!
        </p>}

        {adding && <CartShareModalAdd
            tripId={tripId}
            cartId={cartId}
            itemId={itemId}
            shares={shares}
            done={() => setAdding(false)}
        />}
    </Modal>
}
