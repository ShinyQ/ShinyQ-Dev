/**
 * Resolves a storage key to a secure proxied image URL.
 * If the path is already an absolute URL (http/https) or relative absolute path (/),
 * it is returned as is.
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) {
    return path;
  }
  return `/api/v1/storage/image?key=${encodeURIComponent(path)}`;
}
