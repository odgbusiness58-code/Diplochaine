import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeader({ title, description, align = "center", className }: SectionHeaderProps) {
  return (
    <div className={cn(
      "max-w-2xl",
      align === "center" ? "mx-auto text-center" : "",
      className
    )}>
      <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 text-lg text-slate-600">{description}</p>
      )}
    </div>
  );
}
