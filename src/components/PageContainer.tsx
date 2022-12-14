import { ReactNode } from "react"

type props = {
    children: ReactNode
}
export default function PageContainer({children}: props) {
    return <div className="container py-4 px-4">
        {children}
    </div>
}
