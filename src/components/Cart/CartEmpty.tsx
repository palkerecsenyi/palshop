export default function CartEmpty() {
    return <article className="message is-info">
        <div className="message-header">
            <p>Empty cart</p>
        </div>
        <div className="message-body">
            <p>
                You're ready to add some items! Click the button below to start.
            </p>
        </div>
    </article>
}
