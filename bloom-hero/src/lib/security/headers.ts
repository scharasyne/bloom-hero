type Header = { key: string; value: string };

function getSupabaseOrigins(): string[] {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];

  try {
    const parsed = new URL(url);
    const wsOrigin = parsed.origin.replace(/^http/, "ws");
    return [parsed.origin, wsOrigin];
  } catch {
    return [];
  }
}

function buildContentSecurityPolicy(): string {
  const supabaseOrigins = getSupabaseOrigins();
  const connectSrc = [
    "'self'",
    ...supabaseOrigins,
    "https://nominatim.openstreetmap.org",
    "https://*.tile.openstreetmap.org",
    "https://api.iconify.design",
    "https://api.simplesvg.com",
    "https://api.unisvg.com",
  ].join(" ");
  const imgSrc = [
    "'self'",
    "data:",
    "blob:",
    "https:",
    ...supabaseOrigins,
    "https://*.tile.openstreetmap.org",
    "https://unpkg.com",
  ].join(" ");
  const styleSrc = [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
    "https://unpkg.com",
  ].join(" ");
  const fontSrc = ["'self'", "data:", "https://fonts.gstatic.com"].join(" ");

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'self' https://maps.google.com",
    "object-src 'none'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    `style-src ${styleSrc}`,
    `img-src ${imgSrc}`,
    `font-src ${fontSrc}`,
    `connect-src ${connectSrc}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join("; ");
}

function buildReportOnlyContentSecurityPolicy(): string | null {
  if (process.env.CSP_REPORT_ONLY !== "true") {
    return null;
  }

  return buildContentSecurityPolicy();
}

/** HTTP response headers applied to all routes (see next.config `headers`). */
export function getSecurityHeaders(): Header[] {
  const reportOnlyPolicy = buildReportOnlyContentSecurityPolicy();
  const headers: Header[] = [
    { key: "X-Frame-Options", value: "DENY" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(self), payment=()",
    },
    { key: "X-DNS-Prefetch-Control", value: "on" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-site" },
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy() },
  ];

  if (reportOnlyPolicy) {
    headers.push({
      key: "Content-Security-Policy-Report-Only",
      value: reportOnlyPolicy,
    });
  }

  if (process.env.NODE_ENV === "production") {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains; preload",
    });
  }

  return headers;
}
