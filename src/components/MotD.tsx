import { useMotD } from "../data/motd"
import ReactMarkdown from "react-markdown"
import styles from "../styles/motd.module.scss"

export default function MotD() {
    const motd = useMotD()
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
