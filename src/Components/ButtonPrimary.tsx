export default function ButtonPrimary({
  children,
  className,
  onClick = () => null,
  disabled = false,
  ...rest
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (value?: any) => void;
  disabled?: boolean;
}) {
  const baseClasses =
    'block mx-auto px-8 py-4 bg-gradient-to-br from-primary via-primary to-secondary border-transparent font-medium rounded shadow-sm text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ';
  return (
    <button className={baseClasses + className} onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
