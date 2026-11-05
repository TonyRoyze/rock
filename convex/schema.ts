import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  students: defineTable({
    name: v.string(),
    className: v.string(),
    registrationNumber: v.string(),
    dateOfBirth: v.string(),
    phoneNumber: v.string(),
  }).index('by_registration_number', ['registrationNumber']),
  tournaments: defineTable({
    name: v.string(),
    startDate: v.string(),
    venue: v.string(),
    createdAt: v.number(),
  }),
  events: defineTable({
    tournamentId: v.id('tournaments'),
    name: v.string(),
    ageGroup: v.string(),
    eventDate: v.string(),
  }).index('by_tournament', ['tournamentId']),
  registrations: defineTable({
    studentId: v.id('students'),
    eventId: v.id('events'),
    registeredAt: v.number(),
  }).index('by_event', ['eventId']).index('by_student', ['studentId']),
});
