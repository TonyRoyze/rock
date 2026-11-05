import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const tournaments = await ctx.db.query('tournaments').order('desc').collect();
    return Promise.all(tournaments.map(async (tournament) => ({
      ...tournament,
      events: await ctx.db.query('events').withIndex('by_tournament', q => q.eq('tournamentId', tournament._id)).collect(),
    })));
  },
});

export const create = mutation({
  args: {
    name: v.string(), startDate: v.string(), venue: v.string(),
    events: v.array(v.object({ name: v.string(), ageGroup: v.string(), eventDate: v.string() })),
  },
  handler: async (ctx, args) => {
    const { events, ...tournament } = args;
    const tournamentId = await ctx.db.insert('tournaments', { ...tournament, createdAt: Date.now() });
    for (const event of events) await ctx.db.insert('events', { ...event, tournamentId });
    return tournamentId;
  },
});

export const listEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query('events').collect();
    return Promise.all(events.map(async (event) => ({ ...event, tournament: await ctx.db.get(event.tournamentId) })));
  },
});
