export default function Error(
    {text}: {text?: string}
) {
    if (!text) return <></>
    return <p className="help is-danger">
        {text}
    </p>
}
