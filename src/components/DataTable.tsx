import { flexRender } from '@tanstack/react-table';
import {
  columnFilteringFeature,
  columnVisibilityFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from '@tanstack/react-table';
import { Check, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

const features = tableFeatures({
  columnFilteringFeature,
  columnVisibilityFeature,
  globalFilteringFeature,
  filteredRowModel: createFilteredRowModel(),
  filterFns: { includesString: filterFn_includesString },
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

export function DataTable({ data, columns, emptyText = 'No results.', pageSize = 10 }: any) {
  const table = useTable({
    features,
    columns,
    data,
    globalFilterFn: 'includesString',
    initialState: { pagination: { pageIndex: 0, pageSize } },
  });
  const pageCount = Math.max(1, table.getPageCount());
  const pagination = table.atoms.pagination.get();
  const globalFilter = table.atoms.globalFilter.get() ?? '';

  return (
    <div className="w-full min-w-0">
      <div className="flex items-center justify-between gap-3 px-5 pb-4 md:px-6">
        <div className="relative w-full max-w-sm">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search all columns"
            className="h-9 pl-9"
            placeholder="Search all columns..."
            type="search"
            value={String(globalFilter)}
            onChange={(event) => table.setGlobalFilter(event.target.value)}
          />
        </div>
        <Select value="" onValueChange={(columnId) => {
          const column = table.getColumn(columnId);
          if (column?.getCanHide()) column.toggleVisibility(!column.getIsVisible());
        }}>
          <SelectTrigger aria-label="Choose columns to show or hide" className="h-9 w-32 shrink-0">
            <SelectValue placeholder="Columns" />
          </SelectTrigger>
          <SelectContent align="end">
            {table.getAllLeafColumns().filter((column: any) => column.getCanHide()).map((column: any) => (
              <SelectItem key={column.id} value={column.id}>
                <span className="flex items-center gap-2">
                  <span className="w-4">{column.getIsVisible() && <Check aria-hidden="true" className="size-3.5 text-primary" />}</span>
                  {typeof column.columnDef.header === 'string' ? column.columnDef.header : column.id}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Table aria-label="Data table" tabIndex={0} className="w-full min-w-[760px]">
        <TableHeader>
          {table.getHeaderGroups().map((group: any) => (
            <TableRow key={group.id}>
              {group.headers.map((header: any) => (
                <TableHead key={header.id} className="first:pl-6 md:first:pl-8">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? table.getRowModel().rows.map((row: any) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell: any) => (
                <TableCell key={cell.id} className="first:pl-6 md:first:pl-8">{flexRender(cell.column.columnDef.cell ?? cell.getValue(), cell.getContext())}</TableCell>
              ))}
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 first:pl-6 text-center text-muted-foreground md:first:pl-8">{emptyText}</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <span className="text-xs text-muted-foreground">{table.getRowCount()} row(s)</span>
        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" aria-disabled={!table.getCanPreviousPage()} className={!table.getCanPreviousPage() ? 'pointer-events-none opacity-40' : ''} onClick={(event) => { event.preventDefault(); table.previousPage(); }} />
            </PaginationItem>
            {Array.from({ length: pageCount }, (_, index) => (
              <PaginationItem key={index}>
                <PaginationLink href="#" isActive={pagination.pageIndex === index} onClick={(event) => { event.preventDefault(); table.setPageIndex(index); }}>{index + 1}</PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext href="#" aria-disabled={!table.getCanNextPage()} className={!table.getCanNextPage() ? 'pointer-events-none opacity-40' : ''} onClick={(event) => { event.preventDefault(); table.nextPage(); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
