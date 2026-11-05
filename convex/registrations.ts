import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => {
    const rows = await ctx.db.query('registrations').order('desc').collect();
    return Promise.all(rows.map(async row => ({ ...row, student: await ctx.db.get(row.studentId), event: await ctx.db.get(row.eventId) })));
  },
});

export const add = mutation({
  args: { studentId: v.id('students'), eventId: v.id('events') },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('registrations').withIndex('by_event', q => q.eq('eventId', args.eventId)).filter(q => q.eq(q.field('studentId'), args.studentId)).first();
    if (existing) throw new Error('This student is already registered for this event.');
    return ctx.db.insert('registrations', { ...args, registeredAt: Date.now() });
  },
});
