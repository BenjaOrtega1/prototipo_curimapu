export default function Input({ label, required, children, className = '' }) {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label>
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}
