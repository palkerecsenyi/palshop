import { ReactNode } from "react"

type props = {children?: ReactNode}
export default function ActionContainer({children}: props) {
    return <section className="hero">
        <div className="hero-body">
            <p className="title has-text-centered">
                PalShop
            </p>

            <div className="columns is-centered">
                <div className="column is-half">
                    <div className="box">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    </section>
}
