import {DetailedHTMLProps, SelectHTMLAttributes} from "react"

type props = DetailedHTMLProps<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> & {
    label: string
    help?: string
    // [id, label]
    options: (readonly [string, string])[]
}

export default function Select({ label, help, options, ...selectProps }: props) {
    return <div className="field">
        <label className="label">{label}</label>
        <div className="control select">
            <select
                {...selectProps}
            >
                <option value="" disabled>Please select an option</option>
                {options.map(([id, label]) => <option value={id} key={id}>
                    {label}
                </option>)}
            </select>
        </div>

        {help && <p className="help">
            {help}
        </p>}
    </div>
}
