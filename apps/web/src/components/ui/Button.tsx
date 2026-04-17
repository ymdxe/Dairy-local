import type { ButtonHTMLAttributes, PropsWithChildren } from 'react'

import { buttonStyles, type ButtonSize, type ButtonVariant } from './buttonStyles'

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant
    size?: ButtonSize
  }
>

export function Button({ children, className, variant, size, ...props }: ButtonProps) {
  return (
    <button className={buttonStyles({ variant, size, className })} {...props}>
      {children}
    </button>
  )
}
