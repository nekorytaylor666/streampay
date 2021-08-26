export default function ButtonPrimary({children, className, ...rest}) {
    const baseClasses = "block mx-auto px-8 py-4 bg-gradient-to-br from-primary via-primary to-secondary border-transparent font-medium rounded shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary "
    return (
        <button className={baseClasses + className} {...rest}>
            {children}
        </button>
    )
}
