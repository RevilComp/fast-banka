import FormGroup from "../form/FormGroup";

const Input = ({
  type,
  name,
  placeholder,
  className,
  value,
  onChange,
  onBlur,
  label,
  autoFocus,
  isValid,
  ref,
  disabled,
}) => {
  let inputClasses = `form-input peer w-full border rounded shadow-sm border-gray-300 placeholder:text-white placeholder-opacity-0 focus:ring-0 focus:border-primary text-dark py-3 transition ${className} `;

  let labelClasses =
    "peer absolute text-dark left-2 top-0 peer-focus:text-primary peer-placeholder-shown:text-dark peer-placeholder-shown:!top-1/2 -translate-y-1/2 peer-placeholder-shown:text-gray-500 text-sm bg-white peer-focus:!top-0 transition-all cursor-text px-1 ";

  if (isValid) {
    inputClasses += "!text-danger !border-danger";
    labelClasses += "!text-danger";
  }

  return (
    <FormGroup>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        className={inputClasses}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoFocus={autoFocus}
        autoComplete="off"
        ref={ref}
        disabled={disabled}
      />
      <label htmlFor={name} className={labelClasses}>
        {label}
      </label>
    </FormGroup>
  );
};

export default Input;
