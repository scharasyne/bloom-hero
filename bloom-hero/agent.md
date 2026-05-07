# Agent Rules

- Keep all database calls and server data logic in `src/lib`, grouped by feature/domain.
- Keep reusable client-side UI in `src/components`.
- Do not place database calls in client components.
- If a client component currently performs DB access, move that logic to `src/lib` or server routes/actions.
