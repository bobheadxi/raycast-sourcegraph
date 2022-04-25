export function sentenceCase(sentence: string): string {
  return sentence
    .trim()
    .toLowerCase()
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}
