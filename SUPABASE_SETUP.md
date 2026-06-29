# Supabase Setup

1. Create a Supabase project.
2. Open the Supabase SQL editor and run `supabase-schema.sql`.
3. Open `supabase-config.js`.
4. Add your project URL and anon public key:

```js
window.SITARA_SUPABASE = {
  url: "https://your-project.supabase.co",
  anonKey: "your-anon-public-key",
  table: "sitara_leads",
};
```

The forms on `index.html`, `order.html`, `wholesale.html`, and `contact.html` will save enquiries into the `sitara_leads` table.
