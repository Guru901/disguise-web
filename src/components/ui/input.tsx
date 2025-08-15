import * as React from "react";

import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type InputProps = React.ComponentProps<"input"> & {
  showPasswordToggle?: boolean;
  divClassName?: string;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ divClassName, className, type, showPasswordToggle, ...props }, ref) => {
    const [show, setShow] = React.useState(false);
    const isPassword = type === "password" && showPasswordToggle;
    return (
      <div className={cn("relative", divClassName)}>
        <input
          ref={ref}
          type={isPassword ? (show ? "text" : "password") : type}
          data-slot="input"
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            isPassword ? "pr-10" : "",
            className,
          )}
          {...props}
        />
        {isPassword && (
          <Button
            type="button"
            tabIndex={-1}
            variant="ghost"
            size="icon"
            className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-1"
            onClick={() => setShow((v) => !v)}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
