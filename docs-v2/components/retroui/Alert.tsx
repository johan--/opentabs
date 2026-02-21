import { HtmlHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { Text } from "@/components/retroui/Text";

const alertVariants = cva("relative w-full rounded-(--radius) border-2 p-4", {
  variants: {
    variant: {
      default: "bg-background text-foreground [&_svg]:shrink-0",
      solid: "bg-foreground text-background",
    },
    status: {
      error: "bg-destructive text-destructive-foreground border-destructive",
      success: "bg-accent text-accent-foreground border-accent-foreground",
      warning: "bg-primary text-primary-foreground border-primary-foreground",
      info: "bg-secondary text-secondary-foreground border-secondary-foreground",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface IAlertProps
  extends
    HtmlHTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = ({ className, variant, status, ...props }: IAlertProps) => (
  <div
    role="alert"
    className={cn(alertVariants({ variant, status }), className)}
    {...props}
  />
);
Alert.displayName = "Alert";

interface IAlertTitleProps extends HtmlHTMLAttributes<HTMLHeadingElement> {}
const AlertTitle = ({ className, ...props }: IAlertTitleProps) => (
  <Text as="h5" className={cn(className)} {...props} />
);
AlertTitle.displayName = "AlertTitle";

interface IAlertDescriptionProps extends HtmlHTMLAttributes<HTMLParagraphElement> {}
const AlertDescription = ({ className, ...props }: IAlertDescriptionProps) => (
  <div className={cn("text-muted-foreground", className)} {...props} />
);

AlertDescription.displayName = "AlertDescription";

const AlertComponent = Object.assign(Alert, {
  Title: AlertTitle,
  Description: AlertDescription,
});

export { AlertComponent as Alert };
