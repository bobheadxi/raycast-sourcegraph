export function propsToKeywords(props: { [key: string]: string | undefined }): string[] {
  const keywords: string[] = [];
  Object.keys(props).forEach((key) => {
    if (key) {
      keywords.push(`${key}:${props[key]}`);
    }
  });
  return keywords;
}
