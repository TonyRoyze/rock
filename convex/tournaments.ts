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

export const update = mutation({
  args: {
    tournamentId: v.id('tournaments'),
    name: v.string(),
    startDate: v.string(),
    venue: v.string(),
    events: v.array(v.object({
      eventId: v.optional(v.id('events')),
      name: v.string(),
      ageGroup: v.string(),
      eventDate: v.string(),
    })),
  },
  handler: async (ctx, { tournamentId, events, ...tournament }) => {
    await ctx.db.patch(tournamentId, tournament);
    const currentEvents = await ctx.db.query('events')
      .withIndex('by_tournament', q => q.eq('tournamentId', tournamentId))
      .collect();
    const retainedEventIds = new Set(events.flatMap(event => event.eventId ? [event.eventId] : []));

    for (const event of currentEvents) {
      if (!retainedEventIds.has(event._id)) {
        const registrations = await ctx.db.query('registrations')
          .withIndex('by_event', q => q.eq('eventId', event._id))
          .collect();
        for (const registration of registrations) await ctx.db.delete(registration._id);
        await ctx.db.delete(event._id);
      }
    }

    for (const { eventId, ...event } of events) {
      if (eventId) {
        const existingEvent = await ctx.db.get(eventId);
        if (!existingEvent || existingEvent.tournamentId !== tournamentId) {
          throw new Error('An event does not belong to this tournament.');
        }
        await ctx.db.patch(eventId, event);
      } else {
        await ctx.db.insert('events', { ...event, tournamentId });
      }
    }
  },
});

export const listEvents = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query('events').collect();
    return Promise.all(events.map(async (event) => ({ ...event, tournament: await ctx.db.get(event.tournamentId) })));
  },
});

export const removeEvent = mutation({
  args: { eventId: v.id('events') },
  handler: async (ctx, { eventId }) => {
    const registrations = await ctx.db.query('registrations').withIndex('by_event', q => q.eq('eventId', eventId)).collect();
    for (const registration of registrations) await ctx.db.delete(registration._id);
    await ctx.db.delete(eventId);
  },
});

export const remove = mutation({
  args: { tournamentId: v.id('tournaments') },
  handler: async (ctx, { tournamentId }) => {
    const events = await ctx.db.query('events').withIndex('by_tournament', q => q.eq('tournamentId', tournamentId)).collect();
    for (const event of events) {
      const registrations = await ctx.db.query('registrations').withIndex('by_event', q => q.eq('eventId', event._id)).collect();
      for (const registration of registrations) await ctx.db.delete(registration._id);
      await ctx.db.delete(event._id);
    }
    await ctx.db.delete(tournamentId);
  },
});
