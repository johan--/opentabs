import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentProps } from 'react';
import { cn } from '../../lib/cn';

const Menu = DropdownMenuPrimitive.Root;

const MenuTrigger = DropdownMenuPrimitive.Trigger;

const MenuContent = ({
  className,
  sideOffset = 4,
  ref,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden border border-border bg-background font-mono font-semibold text-foreground text-xs shadow-md',
        className,
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

const MenuItem = ({
  className,
  variant,
  ref,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Item> & { variant?: 'destructive' }) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex w-full cursor-default select-none items-center gap-2 px-2 py-1.5 outline-none focus:bg-primary focus:text-primary-foreground data-[disabled]:pointer-events-none data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground data-disabled:opacity-50 [&_svg:not([class*=size-])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0',
      variant === 'destructive' &&
        'text-destructive focus:bg-destructive/10 focus:text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive',
      className,
    )}
    {...props}
  />
);

const MenuObject = Object.assign(Menu, {
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
});

export { MenuObject as Menu };
