import ReactMarkdown from "react-markdown"
import { useAppSelector } from "../stores/hooks"
import styles from "../styles/motd.module.scss"

export default function MotD() {
    const motd = useAppSelector(state => state.tripsReducer.motd)
    if (motd === undefined) {
        return <></>
    }

    return <article className="message">
        <div className="message-header">
            <p>Message</p>
        </div>
        <div className="message-body">
            <div className={`content ${styles.motdMessageContainer}`}>
                <ReactMarkdown>
                    {motd}
                </ReactMarkdown>
            </div>
        </div>
    </article>
}
