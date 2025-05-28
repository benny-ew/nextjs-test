import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  error?: string;
  fieldError?: string | null;
  touched?: boolean;
  value?: string;
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  helpText?: string;
  showCharCount?: boolean;
  validIcon?: boolean;
  // React Hook Form registration
  registration?: any;
}

export function FormField({
  id,
  label,
  required = false,
  type = 'text',
  placeholder,
  error,
  fieldError,
  touched,
  value = '',
  disabled = false,
  maxLength,
  className = '',
  helpText,
  showCharCount = false,
  validIcon = false,
  registration,
}: FormFieldProps) {
  const hasError = !!(error || fieldError);
  const isValid = touched && !hasError && value.length > 0;
  const showValidation = touched || value.length > 0;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          className={`
            ${hasError && showValidation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${isValid && validIcon ? 'border-green-500 focus:border-green-500 focus:ring-green-500 pr-10' : ''}
          `}
          {...(registration || {})}
        />
        
        {/* Validation Icon */}
        {showValidation && validIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {hasError ? (
              <AlertCircle className="h-4 w-4 text-red-500" />
            ) : isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : null}
          </div>
        )}
      </div>

      {/* Character Count */}
      {showCharCount && maxLength && (
        <div className="flex justify-end">
          <span className={`text-xs ${
            value.length > maxLength * 0.9 
              ? value.length >= maxLength 
                ? 'text-red-500' 
                : 'text-yellow-500'
              : 'text-gray-500'
          }`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}

      {/* Error Message */}
      {(error || fieldError) && showValidation && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error || fieldError}</span>
        </div>
      )}

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

interface FormTextareaProps {
  id: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  error?: string;
  fieldError?: string | null;
  touched?: boolean;
  value?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
  className?: string;
  helpText?: string;
  showCharCount?: boolean;
  // React Hook Form registration
  registration?: any;
}

export function FormTextarea({
  id,
  label,
  required = false,
  placeholder,
  error,
  fieldError,
  touched,
  value = '',
  disabled = false,
  maxLength,
  rows = 3,
  className = '',
  helpText,
  showCharCount = false,
  registration,
}: FormTextareaProps) {
  const hasError = !!(error || fieldError);
  const showValidation = touched || value.length > 0;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <textarea
        id={id}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500
          ${hasError && showValidation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
        `}
        {...(registration || {})}
      />

      {/* Character Count */}
      {showCharCount && maxLength && (
        <div className="flex justify-end">
          <span className={`text-xs ${
            value.length > maxLength * 0.9 
              ? value.length >= maxLength 
                ? 'text-red-500' 
                : 'text-yellow-500'
              : 'text-gray-500'
          }`}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}

      {/* Error Message */}
      {(error || fieldError) && showValidation && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error || fieldError}</span>
        </div>
      )}

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

interface FormSelectProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  fieldError?: string | null;
  touched?: boolean;
  disabled?: boolean;
  className?: string;
  helpText?: string;
  children: React.ReactNode;
  // React Hook Form registration
  registration?: any;
}

export function FormSelect({
  id,
  label,
  required = false,
  error,
  fieldError,
  touched,
  disabled = false,
  className = '',
  helpText,
  children,
  registration,
}: FormSelectProps) {
  const hasError = !!(error || fieldError);
  const showValidation = touched;

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      
      <select
        id={id}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-50 disabled:text-gray-500
          ${hasError && showValidation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
        `}
        {...(registration || {})}
      >
        {children}
      </select>

      {/* Error Message */}
      {(error || fieldError) && showValidation && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          <span>{error || fieldError}</span>
        </div>
      )}

      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}
