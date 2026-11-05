# ROCK

A student and school sports event manager built with Astro, React, shadcn/ui, Tailwind CSS, and Convex.

## Run locally

```sh
pnpm install
pnpm run dev
```

## Connect Convex

`PUBLIC_CONVEX_URL` should contain your Convex deployment URL. Then run:

```sh
npx convex dev
```

The first run connects the project to a Convex deployment and syncs `convex/schema.ts` plus the functions in `convex/`. Convex creates the tables from that schema: `students`, `tournaments`, `events`, and `registrations`.

Student records contain only name, class, registration number, date of birth, and phone number. The app has three sections: Students, Event registration, and Tournaments.
