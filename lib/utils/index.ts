import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ensureUniqueSlug(slug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(slug)) return slug;

  let counter = 1;
  let newSlug = `${slug}-${counter}`;
  while (existingSlugs.includes(newSlug)) {
    counter++;
    newSlug = `${slug}-${counter}`;
  }
  return newSlug;
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(
  date: string | Date | null | undefined
): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeDate(
  date: string | Date | null | undefined
): string {
  if (!date) return "";
  const now = new Date();
  const then = new Date(date);
  const diffMs = then.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays > 0 && diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} days ago`;

  return formatDate(date);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export function parseSiteSettingValue(
  value: string,
  type: string
): string | boolean | number {
  switch (type) {
    case "boolean":
      return value === "true";
    case "number":
      return Number(value);
    case "json":
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

export function getInitials(firstName: string, lastName: string): string {
  return `${(firstName[0] ?? "").toUpperCase()}${(lastName[0] ?? "").toUpperCase()}`;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function absoluteUrl(path: string): string {
  return `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}${path}`;
}
