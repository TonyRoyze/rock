import { query, mutation } from './_generated/server';
import { v } from 'convex/values';

export const list = query({
  args: {},
  handler: async (ctx) => ctx.db.query('students').order('desc').collect(),
});

export const create = mutation({
  args: {
    name: v.string(), className: v.string(), registrationNumber: v.string(),
    dateOfBirth: v.string(), phoneNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query('students').withIndex('by_registration_number', q => q.eq('registrationNumber', args.registrationNumber)).first();
    if (existing) throw new Error('Admission number already exists.');
    return ctx.db.insert('students', args);
  },
});

export const update = mutation({
  args: {
    _id: v.id('students'),
    name: v.string(), className: v.string(), registrationNumber: v.string(),
    dateOfBirth: v.string(), phoneNumber: v.string(),
  },
  handler: async (ctx, { _id, ...args }) => {
    const duplicate = await ctx.db.query('students').withIndex('by_registration_number', q => q.eq('registrationNumber', args.registrationNumber)).first();
    if (duplicate && duplicate._id !== _id) throw new Error('Admission number already exists.');
    await ctx.db.patch(_id, args);
  },
});

export const cleanShashmikaPhone = mutation({
  args: {},
  handler: async (ctx) => {
    const student = await ctx.db.query('students').withIndex('by_registration_number', q => q.eq('registrationNumber', '30485')).first();
    if (!student || student.name !== 'Shashmika Rupasinghe') return false;
    const phoneNumber = student.phoneNumber.replace(/\\+$/, '');
    if (phoneNumber !== student.phoneNumber) await ctx.db.patch(student._id, { phoneNumber });
    return true;
  },
});
