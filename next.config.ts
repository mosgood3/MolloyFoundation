import type { NextConfig } from 'next'

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // apply to every route
        source: '/(.*)',
        headers: [
          // 1) Enforce HTTPS (HSTS) for 2 years + preload
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },

          // 2) Prevent clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },

          // 3) No MIME sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },

          // 4) Lock down referrer header
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },

          // 5) Feature control
          {
            key: 'Permissions-Policy',
            value: [
              'geolocation=()',
              'microphone=()',
              'camera=()',
              'accelerometer=()',
              'payment=(self "https://js.stripe.com")',
            ].join(', '),
          },

          // 6) Block Flash/Adobe cross-domain policies
          {
            key: 'X-Permitted-Cross-Domain-Policies',
            value: 'none',
          },

          // 7) CSP
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""} https://js.stripe.com https://connect.facebook.net`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://www.facebook.com",
              "connect-src 'self' https://*.supabase.co https://api.stripe.com https://checkout.stripe.com https://www.facebook.com",
              "frame-src https://js.stripe.com https://checkout.stripe.com",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },

          // 8) Cross-origin isolation
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ]
  },
}

export default nextConfig