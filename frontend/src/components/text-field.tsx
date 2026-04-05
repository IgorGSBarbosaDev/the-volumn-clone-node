import { useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  action?: ReactNode
  label: string
}

export function TextField({ action, className, label, ...props }: TextFieldProps) {
  const inputId = useId()

  return (
    <div className="field">
      <span className="field__header">
        <label className="field__label" htmlFor={inputId}>
          {label}
        </label>
        {action}
      </span>
      <input className={['field__input', className].filter(Boolean).join(' ')} id={inputId} {...props} />
    </div>
  )
}
