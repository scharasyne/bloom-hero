# Supabase password reset email (required for reliable links)

PKCE reset links fail when the email is opened in a different browser or app (Gmail, Outlook, phone mail). Use this template so links work everywhere.

## Steps

1. Supabase Dashboard → **Authentication** → **Email Templates** → **Reset password**
2. Replace the link with:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Reset your password</a>
```

3. **Authentication** → **URL configuration** → **Redirect URLs**, add:

```
https://bloom-hero.vercel.app/auth/confirm
http://localhost:3000/auth/confirm
```

4. Save, then request a **new** reset email.

## Why

| Link type | Needs same browser? |
|-----------|---------------------|
| Default `{{ .ConfirmationURL }}` (PKCE `code=`) | Yes |
| `token_hash` template above | No |
