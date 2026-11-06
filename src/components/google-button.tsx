/** A plain link: signing in leaves the site for Google, so nothing should prefetch it. */
export function GoogleButton({ next }: { next: "/custom-order" | "/account" | "/checkout" }) {
  return (
    <a href={`/api/auth/google?next=${next}`} className="google-btn">
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.7 1.2 9.2 3.6l6.9-6.9C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l8 6.2C12.5 13.6 17.8 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.9 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.9c-.6 3-2.2 5.5-4.8 7.2l7.8 6c4.5-4.2 7-10.3 7-17.7z" />
        <path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-8-6.2C1 16.4 0 20.1 0 24s1 7.6 2.6 10.8l8-6.2z" />
        <path fill="#34A853" d="M24 48c6.4 0 11.9-2.1 15.9-5.8l-7.8-6c-2.1 1.5-4.9 2.3-8.1 2.3-6.2 0-11.5-4.1-13.4-9.9l-8 6.2C6.5 42.6 14.6 48 24 48z" />
      </svg>
      Continue with Google
    </a>
  );
}
