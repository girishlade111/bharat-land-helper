// src/config/site.ts
// Authoritative Single Source of Truth for Bharat Land Converter configuration

export const SITE_URL = "https://land.ladestack.in";
export const SITE_DOMAIN = "land.ladestack.in";
export const SITE_NAME = "Bharat Land Converter";
export const SITE_DESCRIPTION =
  "Free comprehensive Indian land area converter supporting 35+ units across all Indian states with state-wise accuracy.";
export const OG_IMAGE_URL = `${SITE_URL}/og-image.png`;
export const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

/**
 * Builds an absolute canonical URL on the authoritative production domain.
 * Preserves clean-URL paths without trailing slashes (except root).
 */
export function buildCanonicalUrl(pathname: string = "/"): string {
  if (!pathname || pathname === "/") {
    return `${SITE_URL}/`;
  }
  const cleanPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${cleanPath.replace(/\/+$/, "")}`;
}

