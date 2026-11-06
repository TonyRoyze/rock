import { useEffect, useMemo, useState } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const supportedAgeGroups = ['Under 12', 'Under 13', 'Under 14', 'Under 15', 'Under 16', 'Under 18', 'Under 20'];

export function RegistrationGrid({ students, tournaments, registrations, onToggle, disabled = false }: any) {
  const [tournamentId, setTournamentId] = useState('');
  const [ageGroup, setAgeGroup] = useState('all');
  const [hideNonParticipants, setHideNonParticipants] = useState(false);

  useEffect(() => {
    if (tournaments.length && !tournaments.some((tournament: any) => tournament._id === tournamentId)) {
      setTournamentId(tournaments[0]._id);
    }
  }, [tournaments, tournamentId]);

  const selectedTournament = tournaments.find((tournament: any) => tournament._id === tournamentId);
  const events = useMemo(() => {
    const tournamentEvents = selectedTournament?.events ?? [];
    return tournamentEvents.filter((event: any) => ageGroup === 'all' || event.ageGroup === ageGroup);
  }, [selectedTournament, ageGroup]);
  const availableAgeGroups = supportedAgeGroups.filter((group) =>
    selectedTournament?.events?.some((event: any) => event.ageGroup === group)
  );
  const visibleEventIds = new Set(events.map((event: any) => event._id));
  const participantIds = new Set(registrations
    .filter((registration: any) => visibleEventIds.has(registration.eventId))
    .map((registration: any) => registration.studentId));
  const visibleStudents = hideNonParticipants
    ? students.filter((student: any) => participantIds.has(student._id))
    : students;

  return (
    <Card className="mt-6 w-full min-w-0 gap-0 overflow-hidden border-0 p-4 shadow-none md:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={tournamentId} onValueChange={(value) => { setTournamentId(value); setAgeGroup('all'); }}>
          <SelectTrigger aria-label="Select tournament" className="w-full sm:w-64">
            <SelectValue placeholder="Select tournament" />
          </SelectTrigger>
          <SelectContent>
            {tournaments.map((tournament: any) => (
              <SelectItem key={tournament._id} value={tournament._id}>{tournament.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ageGroup} onValueChange={setAgeGroup} disabled={!selectedTournament}>
          <SelectTrigger aria-label="Filter by age group" className="w-full sm:w-48">
            <SelectValue placeholder="Age group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All age groups</SelectItem>
            {availableAgeGroups.map((group) => <SelectItem key={group} value={group}>{group}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3 sm:ml-auto">
          <Button
            type="button"
            size="sm"
            variant={hideNonParticipants ? 'secondary' : 'outline'}
            disabled={!selectedTournament || events.length === 0}
            aria-pressed={hideNonParticipants}
            onClick={() => setHideNonParticipants((hidden) => !hidden)}
          >
            {hideNonParticipants ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            {hideNonParticipants ? 'Show all students' : 'Hide non-participants'}
          </Button>
          <span className="whitespace-nowrap text-sm text-muted-foreground">
            {selectedTournament ? `${events.length} event${events.length === 1 ? '' : 's'}` : 'No tournaments yet'}
          </span>
        </div>
      </div>

      {!selectedTournament ? (
        <div className="rounded-lg bg-background/40 px-4 py-12 text-center text-sm text-muted-foreground">Create a tournament and add events to register students.</div>
      ) : (
        <div className="w-full overflow-hidden rounded-lg bg-background/30">
          <Table aria-label="Register students to tournament events" tabIndex={0} className="min-w-max">
            <TableHeader>
              <TableRow className="border-b border-white/10 hover:bg-transparent">
                <TableHead className="sticky left-0 z-20 h-52 min-w-64 border-r border-white/10 bg-background/30 pl-5 align-bottom md:pl-6">Student name</TableHead>
                <TableHead className="h-52 min-w-24 border-r border-white/10 align-bottom">Class</TableHead>
                <TableHead className="h-52 min-w-36 border-r border-white/10 align-bottom">Admission number</TableHead>
                {events.map((event: any) => (
                  <TableHead key={event._id} className="h-52 w-16 min-w-16 border-r border-white/10 px-2 align-bottom text-center last:border-r-0">
                    <span
                      className="mx-auto block h-44 w-8 whitespace-nowrap text-center text-muted-foreground"
                      style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      title={`${event.name} · ${event.ageGroup}`}
                    >
                      {event.name}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleStudents.map((student: any) => (
                <TableRow key={student._id} className="border-b border-white/10 hover:bg-white/[0.025]">
                  <TableCell className="sticky left-0 z-10 min-w-64 border-r border-white/10 bg-background/30 py-4 pl-5 font-medium md:pl-6">{student.name}</TableCell>
                  <TableCell className="border-r border-white/10 py-4">{student.className}</TableCell>
                  <TableCell className="border-r border-white/10 py-4 tabular-nums">{student.registrationNumber}</TableCell>
                  {events.map((event: any) => {
                    const registration = registrations.find((row: any) =>
                      row.studentId === student._id && row.eventId === event._id
                    );
                    const isRegistered = Boolean(registration);
                    return (
                      <TableCell key={event._id} className="border-r border-white/10 p-1 text-center last:border-r-0">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="ghost"
                          disabled={disabled}
                          aria-label={`${isRegistered ? 'Remove' : 'Register'} ${student.name} for ${event.name}`}
                          aria-pressed={isRegistered}
                          onClick={() => onToggle(student, event, registration)}
                          className={isRegistered ? 'text-primary hover:text-primary' : 'text-muted-foreground/40 hover:text-primary'}
                        >
                          {isRegistered ? <Check className="size-5" strokeWidth={2.5} /> : null}
                        </Button>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {visibleStudents.length === 0 && (
                <TableRow className="border-b border-white/10">
                  <TableCell colSpan={3 + events.length} className="py-12 text-center text-muted-foreground">
                    {students.length === 0
                      ? 'Add students before registering for events.'
                      : hideNonParticipants
                        ? 'No participants are registered for these events yet.'
                        : 'No students to display.'}
                  </TableCell>
                </TableRow>
              )}
              {visibleStudents.length > 0 && events.length === 0 && (
                <TableRow className="border-b border-white/10">
                  <TableCell colSpan={3} className="py-12 text-center text-muted-foreground">There are no events in this age group.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
