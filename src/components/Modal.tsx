import type { ReactNode } from "react"

type props = {
    close(): void
    title: string
    children: ReactNode
    footer?: ReactNode
}
export default function Modal(
    {close, title, children, footer}: props
) {
    return <div className="modal is-active">
        <div
            onClick={close}
            className="modal-background"
        />
        <div className="modal-card">
            <header className="modal-card-head">
                <p className="modal-card-title">
                    {title}
                </p>
                <button
                    className="delete"
                    aria-label="Close"
                    onClick={close}
                ></button>
            </header>
            <section className="modal-card-body">
                {children}
            </section>
            {footer && <footer className="modal-card-foot">
                {footer}
            </footer>}
        </div>
    </div>
}
