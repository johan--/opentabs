import { cn } from '../../lib/cn';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type { ComponentProps } from 'react';

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
      className={cn('border-border bg-card z-50 w-56 rounded border-2 shadow-md', className)}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
);

const MenuItem = ({ className, ref, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Item>) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'text-foreground focus:bg-primary focus:text-primary-foreground data-[highlighted]:bg-primary data-[highlighted]:text-primary-foreground relative flex cursor-pointer items-center gap-2 px-3 py-1.5 font-sans text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
      className,
    )}
    {...props}
  />
);

const MenuSeparator = ({ className, ref, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Separator>) => (
  <DropdownMenuPrimitive.Separator ref={ref} className={cn('bg-border -mx-1 my-1 h-px', className)} {...props} />
);

const MenuObject = Object.assign(Menu, {
  Trigger: MenuTrigger,
  Content: MenuContent,
  Item: MenuItem,
  Separator: MenuSeparator,
});

export { MenuObject as Menu };
