export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    danger: 'btn btn-danger',
    ghost: 'btn btn-ghost',
  };

  return (
    <button className={`${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
