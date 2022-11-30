import { ReactNode } from "react"
import styles from "../styles/tinsel.module.scss"

type props = {
    children: ReactNode
}
export default function PageContainer({children}: props) {
    return <div>
        <div className={styles.tinselContainer} />

        <div className="container py-4 px-4">
            {children}
        </div>
    </div>
}
