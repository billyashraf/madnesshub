export function calculateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function getExcerpt(content: string, maxLength = 200): string {
  const clean = content.replace(/[#*`_[\]()>~]/g, "").trim();
  return clean.length > maxLength ? clean.slice(0, maxLength).trimEnd() + "…" : clean;
}

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
