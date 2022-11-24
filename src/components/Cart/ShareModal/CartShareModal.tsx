import Modal from "../../Modal"
import CartShareModalRow from "./CartShareModalRow"
import { useState } from "react"
import CartShareModalAdd from "./CartShareModalAdd"
import { useItemSharedToContext } from "../../../data/price"

type props = {
    close(): void
    tripId: string
    cartId: string
    itemId: string
}
export default function CartShareModal(
    { close, tripId, cartId, itemId }: props
) {
    const shares = useItemSharedToContext(itemId)
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
