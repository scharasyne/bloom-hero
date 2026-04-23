I’m checking the auth flow around your login page and proxy so I can explain which responsibilities move out of the client and what can be removed from the page. Next I’ll inspect the proxy and the callback/session code to map the current redirect and role logic.

The proxy only guards access, while the callback currently does the post-login role setup and redirecting. 

Your login page is doing too much right now. It handles sign-in, creates missing database rows, reads role/vendor data, and then chooses a redirect. If you want to "use the proxy" and remove those database calls from Login.tsx, the split should be:

The login page should only authenticate the user and send them to one neutral place afterward. It should not decide the final destination itself.

The proxy in src/proxy.ts should own the routing decision after the session exists. Right now it only blocks unauthenticated users from protected routes. If you want it to replace the redirect logic from the login page, it also needs to handle authenticated users visiting public pages like /login, then forward them to the right destination based on role.

The database writes for first-time users do not belong in the proxy if you can avoid it. Those belong in a server-side place like src/app/auth/callback/route.ts or another server action, because the proxy should stay lightweight and should mostly decide access, not perform account setup.

So the practical plan is:

Keep Login.tsx focused only on sign-in.
Move the "ensure user exists" and "ensure customer row exists" behavior into auth/callback/route.ts or another server-side flow.
Extend src/proxy.ts so authenticated users are redirected away from /login and into the correct area.
Make sure the proxy can read the role without client-side queries. That usually means the role must already be available in the session or in a server-side lookup.
If you want to eliminate database reads everywhere, you would need role information in auth metadata or session claims instead of querying users and vendors on each request.
One important constraint: for email/password login, there is no OAuth callback exchange, so the proxy becomes the post-login router on the next request. For Google login, the callback route is already the right place to finish setup and redirect. That means your two login paths should eventually converge on the same server-side role resolution logic.

If you want, I can next tell you the exact responsibilities each file should have, in plain English, for the password login path and the Google login path separately.