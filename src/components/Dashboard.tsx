import { useEffect, useState } from 'react';
import { CalendarDays, ClipboardList, Pencil, Plus, Trash2, Trophy, Users, X } from 'lucide-react';
import { ConvexProvider, ConvexReactClient, useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { DatePickerInput } from './DatePickerInput';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from './DataTable';
import { toast, Toaster } from 'sonner';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './app-sidebar';

const sampleStudents = [
  { _id:'s1', name:'Shashmika Rupasinghe', className:'7S1', registrationNumber:'30485', dateOfBirth:'2014/06/22', phoneNumber:'0716497923' },
  { _id:'s2', name:'Nigel Michael', className:'MM', registrationNumber:'30605', dateOfBirth:'2014/02/20', phoneNumber:'0771770056' },
  { _id:'s3', name:'Saven Nicole', className:'7S4', registrationNumber:'30467', dateOfBirth:'2014/10/21', phoneNumber:'0711018658' },
  { _id:'s4', name:'Raphael Rathnayake', className:'7E1', registrationNumber:'30563', dateOfBirth:'2014/03/16', phoneNumber:'0767932668' },
  { _id:'s5', name:'Aken Pelris', className:'7S1', registrationNumber:'30539', dateOfBirth:'2014/05/18', phoneNumber:'0777419634' },
  { _id:'s6', name:'Joshua Rodrigo', className:'7S3', registrationNumber:'30575', dateOfBirth:'2014/08/12', phoneNumber:'0704888282' },
  { _id:'s7', name:'Lawrence Abimail', className:'7S1', registrationNumber:'30509', dateOfBirth:'2014/09/15', phoneNumber:'0771481548' },
  { _id:'s8', name:'Jalden Hakel', className:'7E2', registrationNumber:'30635', dateOfBirth:'2014/07/23', phoneNumber:'0777489146' },
  { _id:'s9', name:'Kyle Boudewyn', className:'7E2', registrationNumber:'30689', dateOfBirth:'2014/06/24', phoneNumber:'0759494999' },
];
const sampleTournament = { _id:'t1', name:'Annual Sports Meet', startDate:'2026-06-20', venue:'School Grounds', events:[{_id:'e1',name:'100m Sprint',ageGroup:'Under 15',eventDate:'2026-06-20'},{_id:'e2',name:'Long Jump',ageGroup:'Under 17',eventDate:'2026-06-20'}] };
const ageGroups = ['Under 12','Under 13','Under 14','Under 15','Under 16','Under 18','Under 20'];
const blankEvent = () => ({ name:'', ageGroup:'Under 15', eventDate:'' });
const normalizeDate = (value?:string) => value?.includes('-') ? value.replaceAll('-', '/') : value ?? '';

function App({ students:remoteStudents, tournaments:remoteTournaments, events:remoteEvents, registrations:remoteRegistrations, createStudent, createTournament, registerStudent, updateStudent, deleteStudent, deleteRegistration, deleteTournament, deleteEvent, updateTournament }:any) {
  const [page, setPage] = useState('Students');
  const [localStudents, setLocalStudents] = useState(sampleStudents);
  const [localTournaments, setLocalTournaments] = useState([sampleTournament]);
  const [localRegistrations, setLocalRegistrations] = useState<any[]>([]);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [studentId, setStudentId] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [tournamentOpen, setTournamentOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<any>(null);
  const [eventRows, setEventRows] = useState<any[]>([blankEvent()]);
  const students = remoteStudents ?? localStudents;
  const classOrder = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
  const organizedStudents = [...students].sort((a:any,b:any) =>
    classOrder.compare(a.className, b.className) || classOrder.compare(a.name, b.name)
  );
  const tournaments = remoteTournaments ?? localTournaments;
  const events = remoteEvents ?? tournaments.flatMap((t:any)=>t.events.map((e:any)=>({...e,tournament:t})));
  const registrations = remoteRegistrations ?? localRegistrations;
  const notify = (message:string) => toast(message);

  const onAddStudent = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    try { const record={ name:String(data.get('name')).trim(), className:String(data.get('className')), registrationNumber:String(data.get('registrationNumber')).trim(), dateOfBirth:String(data.get('dateOfBirth')), phoneNumber:String(data.get('phoneNumber')).trim() }; if(createStudent) await createStudent(record); else setLocalStudents(curr=>[{...record,_id:crypto.randomUUID()},...curr]); notify('Student added.'); setAddOpen(false); }
    catch(err:any) { notify(err.message ?? 'Could not save student.'); }
  };
  const onEditStudent = async (e:React.FormEvent<HTMLFormElement>) => { e.preventDefault(); const data=new FormData(e.currentTarget); const record={name:String(data.get('name')).trim(),className:String(data.get('className')),registrationNumber:String(data.get('registrationNumber')).trim(),dateOfBirth:String(data.get('dateOfBirth')),phoneNumber:String(data.get('phoneNumber')).trim()}; try { if(updateStudent) await updateStudent({_id:editingStudent._id,...record}); else setLocalStudents(curr=>curr.map(s=>s._id===editingStudent._id?{...s,...record}:s)); notify('Student updated.'); setEditingStudent(null); } catch(err:any) { notify(err.message??'Could not update student.'); } };
  const removeStudent = async (student:any) => { if(!window.confirm(`Delete ${student.name}?`)) return; try { if(deleteStudent) await deleteStudent({studentId:student._id}); else setLocalStudents(curr=>curr.filter(s=>s._id!==student._id)); notify('Student deleted.'); } catch(err:any) { notify(err.message??'Could not delete student.'); } };
  const removeRegistration = async (row:any) => { if(!window.confirm('Remove this event registration?')) return; try { if(deleteRegistration) await deleteRegistration({registrationId:row._id}); else setLocalRegistrations(curr=>curr.filter(r=>r._id!==row._id)); notify('Registration removed.'); } catch(err:any) { notify(err.message??'Could not remove registration.'); } };
  const removeTournament = async (tournament:any) => { if(!window.confirm(`Delete ${tournament.name} and all its events and registrations?`)) return; try { if(deleteTournament) await deleteTournament({tournamentId:tournament._id}); else setLocalTournaments(curr=>curr.filter(t=>t._id!==tournament._id)); notify('Tournament deleted.'); } catch(err:any) { notify(err.message??'Could not delete tournament.'); } };
  const removeEvent = async (event:any) => { if(!window.confirm(`Delete ${event.name} and its registrations?`)) return; try { if(deleteEvent) await deleteEvent({eventId:event._id}); else setLocalTournaments(curr=>curr.map(t=>({...t,events:t.events.filter((e:any)=>e._id!==event._id)}))); notify('Event deleted.'); } catch(err:any) { notify(err.message??'Could not delete event.'); } };
  const openTournamentEditor = (tournament:any) => {
    setEditingTournament(tournament);
    setEventRows(tournament.events.map((event:any)=>({ _id:event._id, name:event.name, ageGroup:event.ageGroup, eventDate:normalizeDate(event.eventDate) })));
    setTournamentOpen(true);
  };
  const onCreateTournament = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); const data = new FormData(e.currentTarget);
    const cleanEvents = eventRows.filter(r=>r.name.trim()).map(r=>({name:r.name.trim(),ageGroup:r.ageGroup,eventDate:r.eventDate}));
    if (!cleanEvents.length) { notify('Add at least one event.'); return; }
    const record={name:String(data.get('name')).trim(),startDate:String(data.get('startDate')),venue:String(data.get('venue')).trim()};
    try {
      if (editingTournament) {
        const eventsWithIds=eventRows.filter(r=>r.name.trim()).map(r=>({_id:r._id,name:r.name.trim(),ageGroup:r.ageGroup,eventDate:r.eventDate}));
        if (updateTournament) await updateTournament({tournamentId:editingTournament._id,...record,events:eventsWithIds.map(({_id,...event})=>({...event,...(_id?{eventId:_id}:{})}))});
        else setLocalTournaments(curr=>curr.map(t=>t._id===editingTournament._id?{...t,...record,events:eventsWithIds.map((event:any)=>({...event,_id:event._id??crypto.randomUUID()}))}:t));
        notify('Tournament updated.');
      } else {
        await createTournament?.({...record,events:cleanEvents});
        if(!createTournament) notify('Connect Convex to save tournaments.'); else notify('Tournament created.');
      }
      setTournamentOpen(false); setEditingTournament(null); setEventRows([blankEvent()]);
    } catch(err:any) { notify(err.message ?? (editingTournament?'Could not update tournament.':'Could not create tournament.')); }
  };
  const onRegister = async (e:React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); if(!studentId || !selectedEvent) { notify('Choose a student and event.'); return; }
    try { await registerStudent?.({studentId,eventId:selectedEvent as any}); if(!registerStudent) notify('Connect Convex to save registrations.'); else notify('Student registered for event.'); }
    catch(err:any) { notify(err.message ?? 'Could not register student.'); }
  };
  const studentColumns:any[] = [
    {accessorKey:'name',header:'Name',filterFn:'includesString'},
    {accessorKey:'className',header:'Class',filterFn:'includesString'},
    {accessorKey:'registrationNumber',header:'Admission number',filterFn:'includesString'},
    {accessorKey:'dateOfBirth',header:'Date of birth',filterFn:'includesString'},
    {accessorKey:'phoneNumber',header:'Phone number',filterFn:'includesString'},
    {id:'actions',header:'',enableColumnFilter:false,enableHiding:false,cell:({row}:any)=><div className="flex items-center gap-1"><Button size="sm" variant="outline" onClick={()=>setEditingStudent(row.original)}>Edit</Button><Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" aria-label={`Delete ${row.original.name}`} onClick={()=>removeStudent(row.original)}><Trash2/></Button></div>},
  ];
  const registrationColumns:any[] = [
    {accessorFn:(row:any)=>row.student?.name??'Student',id:'student',header:'Student',filterFn:'includesString'},
    {accessorFn:(row:any)=>row.event?.name??'Event',id:'event',header:'Event',filterFn:'includesString'},
    {accessorFn:(row:any)=>row.event?.ageGroup??'',id:'ageGroup',header:'Age group',filterFn:'includesString'},
    {id:'actions',header:'',enableColumnFilter:false,enableHiding:false,cell:({row}:any)=><Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" aria-label="Remove registration" onClick={()=>removeRegistration(row.original)}><Trash2/></Button>},
  ];


  return <SidebarProvider defaultOpen={true} className="min-h-screen min-w-[320px] bg-background font-sans text-foreground">
    <Toaster position="bottom-right" richColors/>
    <AppSidebar page={page} onNavigate={setPage}/>
    <SidebarInset className="min-h-screen min-w-0">

      <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/95 px-5 backdrop-blur md:px-8"><div className="flex items-center gap-3"><SidebarTrigger/><span className="text-sm font-medium">{page}</span></div><Badge variant="outline" className="gap-2 text-xs"><span className={`size-1.5 rounded-full ${import.meta.env.PUBLIC_CONVEX_URL?'bg-primary':'bg-amber-400'}`}/>{import.meta.env.PUBLIC_CONVEX_URL?'Connected':'Demo mode'}</Badge></header>
      <div className="w-full min-w-0 px-5 py-8 md:px-8">
        {page==='Students'&&<>
          <PageHeading eyebrow="STUDENT RECORDS" title="Students" description="Manage student details for event registration." action={<Dialog open={addOpen} onOpenChange={setAddOpen}><DialogTrigger asChild><Button><Plus/>Add student</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Add student</DialogTitle><DialogDescription>Enter the student's school and contact details.</DialogDescription></DialogHeader><form onSubmit={onAddStudent} className="grid gap-4"><Field label="Full name"><Input name="name" autoComplete="name" required placeholder="Student name"/></Field><div className="grid grid-cols-2 gap-3"><Field label="Class"><Input name="className" required placeholder="e.g. 10A"/></Field><Field label="Admission number"><Input name="registrationNumber" required placeholder="e.g. R-2026-001"/></Field></div><div className="grid grid-cols-2 gap-3"><DatePickerInput name="dateOfBirth" required/><Field label="Phone number"><Input name="phoneNumber" type="tel" required placeholder="Student phone"/></Field></div><DialogFooter><Button type="submit">Save student</Button></DialogFooter></form></DialogContent></Dialog>}/>
          <Card className="mt-6 w-full min-w-0 gap-0 overflow-hidden border-0 py-5 shadow-none"><DataTable data={organizedStudents} columns={studentColumns} emptyText="No students match those filters."/></Card>
          <Dialog open={Boolean(editingStudent)} onOpenChange={open=>!open&&setEditingStudent(null)}><DialogContent><DialogHeader><DialogTitle>Edit student</DialogTitle><DialogDescription>Update the student details.</DialogDescription></DialogHeader>{editingStudent&&<form key={editingStudent._id} onSubmit={onEditStudent} className="grid gap-4"><Field label="Full name"><Input name="name" defaultValue={editingStudent.name} required/></Field><div className="grid grid-cols-2 gap-3"><Field label="Class"><Input name="className" defaultValue={editingStudent.className} required/></Field><Field label="Admission number"><Input name="registrationNumber" defaultValue={editingStudent.registrationNumber} required/></Field></div><div className="grid grid-cols-2 gap-3"><DatePickerInput name="dateOfBirth" value={editingStudent.dateOfBirth} required/><Field label="Phone number"><Input name="phoneNumber" defaultValue={editingStudent.phoneNumber} required/></Field></div><DialogFooter><Button type="submit">Save changes</Button></DialogFooter></form>}</DialogContent></Dialog>
        </>}
        {page==='Event registration'&&<>
          <PageHeading eyebrow="EVENT REGISTRATION" title="Register students" description="Assign students to events in a tournament."/>
          <div className="mt-6 grid gap-6"><Card><CardHeader><CardTitle>New registration</CardTitle><CardDescription>Select an event and student.</CardDescription></CardHeader><CardContent><form onSubmit={onRegister} className="grid gap-4"><Field label="Tournament event"><Select value={selectedEvent} onValueChange={setSelectedEvent}><SelectTrigger><SelectValue placeholder="Choose an event"/></SelectTrigger><SelectContent>{events.map((ev:any)=><SelectItem key={ev._id} value={ev._id}>{ev.name} · {ev.ageGroup}</SelectItem>)}</SelectContent></Select></Field><Field label="Student"><Select value={studentId} onValueChange={setStudentId}><SelectTrigger><SelectValue placeholder="Choose a student"/></SelectTrigger><SelectContent>{organizedStudents.map((s:any)=><SelectItem key={s._id} value={s._id}>{s.className} · {s.name} · {s.registrationNumber}</SelectItem>)}</SelectContent></Select></Field><Button type="submit" className="mt-2"><Plus/>Register student</Button></form></CardContent></Card><Card className="w-full min-w-0 gap-0 overflow-hidden border-0 py-5 shadow-none"><DataTable data={registrations} columns={registrationColumns} emptyText="No registrations match those filters."/></Card></div>
        </>}
        {page==='Tournaments'&&<>
          <PageHeading eyebrow="TOURNAMENT SETUP" title="Tournaments & events" description="Create a tournament, then define its events and age groups." action={<Dialog open={tournamentOpen} onOpenChange={open=>{setTournamentOpen(open);if(!open){setEditingTournament(null);setEventRows([blankEvent()]);}}}><DialogTrigger asChild><Button onClick={()=>{setEditingTournament(null);setEventRows([blankEvent()]);}}><Plus/>Create tournament</Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl"><DialogHeader><DialogTitle>{editingTournament?"Edit tournament":"Create tournament"}</DialogTitle><DialogDescription>{editingTournament?"Update tournament details and its events.":"Add tournament details and its events."}</DialogDescription></DialogHeader><form onSubmit={onCreateTournament} className="grid gap-4"><div className="grid gap-3 sm:grid-cols-2"><Field label="Tournament name"><Input name="name" required placeholder="Annual Sports Meet" defaultValue={editingTournament?.name}/></Field><Field label="Venue"><Input name="venue" required placeholder="School grounds" defaultValue={editingTournament?.venue}/></Field></div><DatePickerInput key={editingTournament?._id??"new-tournament-date"} name="startDate" label="Start date" value={normalizeDate(editingTournament?.startDate)}/><div className="flex items-center justify-between border-t pt-4"><div><p className="text-sm font-medium">Events</p><p className="text-xs text-muted-foreground">Set an age group for each event.</p></div><Button type="button" variant="outline" size="sm" onClick={()=>setEventRows([...eventRows,blankEvent()])}><Plus/>Add event</Button></div>{eventRows.map((row,index)=><div key={index} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-[1.3fr_1fr_1fr]"><Field label="Event name"><Input value={row.name} onChange={e=>setEventRows(eventRows.map((r,i)=>i===index?{...r,name:e.target.value}:r))} required placeholder="100m sprint"/></Field><Field label="Age group"><Select value={row.ageGroup} onValueChange={ageGroup=>setEventRows(eventRows.map((r,i)=>i===index?{...r,ageGroup}:r))}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{ageGroups.map(age=><SelectItem key={age} value={age}>{age}</SelectItem>)}</SelectContent></Select></Field><DatePickerInput key={row._id??`new-${index}`} name={`eventDate-${index}`} label="Event date" value={row.eventDate} onValueChange={eventDate=>setEventRows(eventRows.map((r,i)=>i===index?{...r,eventDate}:r))}/>{eventRows.length>1&&<Button type="button" variant="ghost" size="sm" className="sm:col-span-3 sm:justify-self-end" onClick={()=>setEventRows(eventRows.filter((_,i)=>i!==index))}><X/>Remove event</Button>}</div>)}<DialogFooter><Button type="submit">{editingTournament?"Save changes":"Create tournament"}</Button></DialogFooter></form></DialogContent></Dialog>}/>
          <div className="mt-6 grid gap-4">{tournaments.map((t:any)=><Card key={t._id}><CardHeader className="flex flex-row items-start justify-between"><div><CardTitle>{t.name}</CardTitle><CardDescription className="mt-1 flex items-center gap-2"><CalendarDays className="size-3.5"/>{t.startDate||'Date not set'} <span>·</span>{t.venue}</CardDescription></div><div className="flex items-center gap-2"><Badge variant="secondary">{t.events?.length??0} events</Badge><Button size="sm" variant="outline" onClick={()=>openTournamentEditor(t)}><Pencil/>Edit</Button><Button size="icon-sm" variant="ghost" className="text-destructive hover:text-destructive" aria-label={`Delete ${t.name}`} onClick={()=>removeTournament(t)}><Trash2/></Button></div></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{t.events?.map((ev:any)=><div className="flex items-center justify-between rounded-lg border bg-background/60 p-3" key={ev._id}><div><p className="text-sm font-medium">{ev.name}</p><p className="mt-1 text-xs text-muted-foreground">{ev.eventDate||'Date not set'}</p></div><div className="flex items-center gap-2"><Badge variant="outline">{ev.ageGroup}</Badge><Button size="icon-xs" variant="ghost" className="text-destructive hover:text-destructive" aria-label={`Delete ${ev.name}`} onClick={()=>removeEvent(ev)}><Trash2/></Button></div></div>)}</CardContent></Card>)}{!tournaments.length&&<Card><CardContent className="py-12 text-center text-sm text-muted-foreground">No tournaments created yet.</CardContent></Card>}</div>
        </>}
      </div>
  </SidebarInset></SidebarProvider>;
}
function Field({label,children}:any){return <div className="grid gap-2"><Label>{label}</Label>{children}</div>}
function PageHeading({eyebrow,title,description,action}:any){return <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[.16em] text-primary">{eyebrow}</p><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{action}</div>}

const client=import.meta.env.PUBLIC_CONVEX_URL?new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL):null;
function ConnectedApp(){
 const students=useQuery(api.students.list,{}); const tournaments=useQuery(api.tournaments.list,{}); const events=useQuery(api.tournaments.listEvents,{}); const registrations=useQuery(api.registrations.list,{});
 const createStudent=useMutation(api.students.create); const updateStudent=useMutation(api.students.update); const deleteStudent=useMutation(api.students.remove); const deleteRegistration=useMutation(api.registrations.remove); const deleteTournament=useMutation(api.tournaments.remove); const deleteEvent=useMutation(api.tournaments.removeEvent); const cleanShashmikaPhone=useMutation(api.students.cleanShashmikaPhone);
 useEffect(()=>{ void cleanShashmikaPhone({}); },[cleanShashmikaPhone]); const createTournament=useMutation(api.tournaments.create); const updateTournament=useMutation(api.tournaments.update); const registerStudent=useMutation(api.registrations.add);
 return <App students={students} tournaments={tournaments} events={events} registrations={registrations} createStudent={createStudent} updateStudent={updateStudent} deleteStudent={deleteStudent} deleteRegistration={deleteRegistration} deleteTournament={deleteTournament} deleteEvent={deleteEvent} createTournament={createTournament} updateTournament={updateTournament} registerStudent={registerStudent}/>;
}
export default function Dashboard(){return client?<ConvexProvider client={client}><ConnectedApp/></ConvexProvider>:<App/>;}
