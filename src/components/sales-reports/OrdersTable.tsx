
'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  ColumnFiltersState,
  getFilteredRowModel,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { SalesReportOrder } from '@/lib/types';
import { Badge } from '../ui/badge';
import { cn } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';

const statusColors: Record<string, string> = {
    new: 'bg-blue-500/20 text-blue-300',
    paid: 'bg-yellow-500/20 text-yellow-300',
    served: 'bg-purple-500/20 text-purple-300',
    done: 'bg-green-500/20 text-green-300'
}


const columns: ColumnDef<SalesReportOrder>[] = [
    {
        accessorKey: 'token',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="-ml-4"
            >
              Order ID
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => <div className="font-mono">#{row.original.token}</div>,
    },
    {
        accessorKey: 'date',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
               className="-ml-4"
            >
              Date
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          )
        },
        cell: ({ row }) => new Date(row.original.date).toLocaleString(),
    },
    {
        accessorKey: 'customerName',
        header: 'Customer',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
            <Badge className={cn("font-bold capitalize", statusColors[row.original.status] || 'bg-gray-500')}>
                {row.original.status}
            </Badge>
        ),
    },
    {
        accessorKey: 'total',
        header: ({ column }) => {
          return (
            <div className="text-right">
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="-mr-4"
                >
                    Amount
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            </div>
          )
        },
        cell: ({ row }) => {
          const amount = parseFloat(row.getValue('total'))
          const formatted = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
          }).format(amount)
     
          return <div className="text-right font-medium">{formatted}</div>
        },
    },
];

interface OrdersTableProps {
  data: SalesReportOrder[];
}

export function OrdersTable({ data }: OrdersTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: 'date', desc: true } // Default sort by date descending
  ]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div className="w-full">
       <div className="flex items-center py-4">
        <Input
          placeholder="Filter by customer..."
          value={(table.getColumn("customerName")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("customerName")?.setFilterValue(event.target.value)
          }
          className="max-w-sm bg-background"
        />
      </div>
      <div className="rounded-md border border-white/10">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-white/10 hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-white/10"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
