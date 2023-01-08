import { useMotD } from "../data/motd"
import ReactMarkdown from "react-markdown"

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
            <ReactMarkdown>
                {motd}
            </ReactMarkdown>
        </div>
    </article>
}
