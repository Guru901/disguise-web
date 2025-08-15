import { Input } from "@/components/ui/input";
import type { LucideIcon } from "lucide-react";

export default function InputWithStartIcon({
  id,
  Icon,
  value,
  onChange,
  placeholder,
  className,
}: {
  id: string;
  Icon: LucideIcon;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className="*:not-first:mt-2">
      <div className="relative">
        <Input
          id={id}
          className={`peer ps-9 ${className}`}
          placeholder={placeholder ?? ""}
          value={value}
          onChange={onChange}
        />
        <div className="text-muted-foreground/80 pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 peer-disabled:opacity-50">
          <Icon size={16} aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
