import React, { useEffect, useState, forwardRef } from 'react';
import { Input } from './Input';
import { formatCentsToInput, parseCurrencyToCents } from '../utils/format';
interface MoneyInputProps extends
  Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value'>
{
  label?: string;
  error?: string;
  value?: number; // Value in cents
  onChange?: (cents: number) => void;
}
export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ label, error, value = 0, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatCentsToInput(value));
    useEffect(() => {
      // Only update display value if it differs from the parsed current input
      // This prevents cursor jumping while typing
      if (parseCurrencyToCents(displayValue) !== value) {
        setDisplayValue(formatCentsToInput(value));
      }
    }, [value]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let val = e.target.value;
      // Allow only digits and comma
      val = val.replace(/[^\d,]/g, '');
      // Ensure only one comma
      const parts = val.split(',');
      if (parts.length > 2) {
        val = parts[0] + ',' + parts.slice(1).join('');
      }
      setDisplayValue(val);
      if (onChange) {
        onChange(parseCurrencyToCents(val));
      }
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Format nicely on blur
      setDisplayValue(formatCentsToInput(parseCurrencyToCents(displayValue)));
      if (props.onBlur) props.onBlur(e);
    };
    return (
      <Input
        ref={ref}
        label={label}
        error={error}
        leftIcon={<span className="text-sm font-medium">R$</span>}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="0,00"
        {...props} />);


  }
);
MoneyInput.displayName = 'MoneyInput';