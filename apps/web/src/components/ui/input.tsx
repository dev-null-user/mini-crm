import * as React from 'react';
import { cn } from '../../lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'flex h-8 w-full rounded-md border-0 bg-[#f0f1f5] px-3 text-xs text-[#252833] outline-none placeholder:text-[#969ba8] focus-visible:ring-2 focus-visible:ring-[#6e83e9]/40 disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
