import type { DetailedHTMLProps, InputHTMLAttributes, ReactNode } from "react"

type props = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    label: string,
    help?: string,
    leftIcon?: ReactNode
}
export default function Input({label, help, leftIcon, ...inputProps}: props) {
    return <div className="field">
        <label className="label">
            {label}
            <div className={`control ${leftIcon ? "has-icons-left" : ""}`}>
                <input
                    className="input"
                    {...inputProps}
                />
                {leftIcon && <span className="icon is-small is-left">
                    {leftIcon}
                </span>}
            </div>
        </label>
        {help && <p className="help">
            {help}
        </p>}
    </div>
}
