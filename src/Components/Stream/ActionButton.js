export default function ActionButton(props: { title: string, action: void, color: string }) {
    const {title, action, color} = props;

    return (
        <button onClick={action}
                className={`rounded-md text-sm bg-${color}-500 hover:bg-${color}-700 active:bg-${color}-900 text-white py-1 px-2`}>
            {title}
        </button>
    )
}