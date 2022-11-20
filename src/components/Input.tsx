import type { DetailedHTMLProps, InputHTMLAttributes, ReactNode } from "react"

type props = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    label?: string,
    help?: string,
    leftIcon?: ReactNode
}
export default function Input({label, help, leftIcon, ...inputProps}: props) {
    const isCheckbox = inputProps.type === "checkbox";
    return <div className="field">
        <label className={isCheckbox ? 'checkbox' : 'label'}>
            {isCheckbox ? '' : label}
            {!isCheckbox ?
                <div className={`control ${leftIcon ? "has-icons-left" : ""}`}>
                    <input
                        className="input"
                        {...inputProps}
                    />
                    {leftIcon && <span className="icon is-small is-left">
                        {leftIcon}
                    </span>}
                </div>
                :
                <input
                    className="mr-2"
                    {...inputProps}
                />
            }
            {isCheckbox ? label : ''}
        </label>
        {help && <p className="help">
            {help}
        </p>}
    </div>
}
