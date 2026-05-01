type ClassValue = string | number | null | undefined | false | Record<string, boolean | undefined | null> | ClassValue[];

export function cn(...inputs: ClassValue[]): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string" || typeof input === "number") {
      out.push(String(input));
    } else if (Array.isArray(input)) {
      out.push(cn(...input));
    } else if (typeof input === "object") {
      for (const [k, v] of Object.entries(input)) {
        if (v) out.push(k);
      }
    }
  }
  return out.join(" ").trim();
}

export function formatDate(input: string | Date, locale = "fr-FR"): string {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function shortHash(value: string | undefined | null, head = 8, tail = 6): string {
  if (!value) return "";
  if (value.length <= head + tail + 3) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}
