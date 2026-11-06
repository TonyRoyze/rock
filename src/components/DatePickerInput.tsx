import * as React from 'react';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Field, FieldLabel } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '@/components/ui/input-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function formatDate(date?: Date) {
  if (!date) return '';
  return `${date.getFullYear()}/${String(date.getMonth()+1).padStart(2,'0')}/${String(date.getDate()).padStart(2,'0')}`;
}
function parseDate(value: string) {
  const match = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return undefined;
  const [, year, month, day] = match;
  const date = new Date(Number(year), Number(month)-1, Number(day));
  return date.getFullYear()===Number(year) && date.getMonth()===Number(month)-1 && date.getDate()===Number(day) ? date : undefined;
}

export function DatePickerInput({ name, label='Date of birth', id=name, value: initialValue='', required=false, onValueChange }: {name:string; label?:string; id?:string; value?:string; required?:boolean; onValueChange?:(value:string)=>void}) {
  const initialDate = parseDate(initialValue);
  const [open,setOpen] = React.useState(false);
  const [date,setDate] = React.useState<Date|undefined>(initialDate);
  const [month,setMonth] = React.useState<Date|undefined>(initialDate);
  const [value,setValue] = React.useState(initialValue);
  const validDate = parseDate(value);
  return <Field>
    <FieldLabel htmlFor={id}>{label}</FieldLabel>
    <InputGroup>
      <InputGroupInput id={id} value={value} placeholder="YYYY/MM/DD" required={required} aria-invalid={Boolean(value && !validDate)} onChange={e=>{const next=e.target.value;setValue(next);onValueChange?.(next);const parsed=parseDate(next);if(parsed){setDate(parsed);setMonth(parsed);}}} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);}}}/>
      <InputGroupAddon align="inline-end"><Popover open={open} onOpenChange={setOpen}><PopoverTrigger asChild><InputGroupButton type="button" variant="ghost" size="icon-xs" aria-label="Choose date"><CalendarIcon/><span className="sr-only">Choose date</span></InputGroupButton></PopoverTrigger><PopoverContent className="w-auto overflow-hidden p-0" align="end" sideOffset={8}><Calendar mode="single" selected={date} month={month} onMonthChange={setMonth} onSelect={next=>{setDate(next);const formatted=formatDate(next);setValue(formatted);onValueChange?.(formatted);setOpen(false);}}/></PopoverContent></Popover></InputGroupAddon>
    </InputGroup>
    <input type="hidden" name={name} value={validDate?formatDate(validDate):''}/>
  </Field>;
}
