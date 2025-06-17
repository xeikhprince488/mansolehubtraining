"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Database, Filter } from "lucide-react";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchPlaceholder?: string;
  searchColumn?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Filter courses by title...",
  searchColumn = "title",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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

  const totalRows = table.getFilteredRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const totalPages = table.getPageCount();
  const pageSize = table.getState().pagination.pageSize;
  const startRow = table.getState().pagination.pageIndex * pageSize + 1;
  const endRow = Math.min(startRow + pageSize - 1, totalRows);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg">
            <Database className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Data Management</h3>
            <p className="text-sm text-slate-500">
              {totalRows} {totalRows === 1 ? 'record' : 'records'} found
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder={searchPlaceholder}
            value={(table.getColumn(searchColumn)?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn(searchColumn)?.setFilterValue(event.target.value)
            }
            className={cn(
              "pl-10 pr-4 h-11 w-full sm:w-80",
              "bg-gradient-to-r from-slate-50 to-blue-50/30",
              "border-2 border-slate-200/60",
              "hover:border-blue-300/60 hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-indigo-50/30",
              "focus:border-blue-500/60 focus:ring-4 focus:ring-blue-100/50",
              "transition-all duration-300 ease-in-out",
              "shadow-sm hover:shadow-md",
              "rounded-xl"
            )}
          />
          {(table.getColumn(searchColumn)?.getFilterValue() as string) && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500" />
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className={cn(
        "rounded-2xl border-2 border-slate-200/60 overflow-hidden",
        "bg-white/80 backdrop-blur-sm shadow-xl",
        "transition-all duration-300 hover:shadow-2xl"
      )}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id}
                className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b-2 border-slate-100 hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-indigo-50/30"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead 
                      key={header.id}
                      className="text-slate-700 font-semibold py-4 px-6 text-sm tracking-wide"
                    >
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
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    "border-b border-slate-100/60 transition-all duration-200",
                    "hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/20",
                    "hover:border-blue-200/40",
                    index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell 
                      key={cell.id}
                      className="py-4 px-6 text-sm font-medium text-slate-700"
                    >
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
                  className="h-32 text-center"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-slate-100 to-blue-100 flex items-center justify-center">
                      <Database className="h-7 w-7 text-slate-400" />
                    </div>
                    <div>
                      <p className="text-slate-600 font-medium text-lg">No results found</p>
                      <p className="text-slate-400 text-sm mt-1">Try adjusting your search criteria</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Section */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Results Info */}
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Filter className="h-4 w-4" />
          <span>
            Showing {totalRows > 0 ? startRow : 0} to {totalRows > 0 ? endRow : 0} of {totalRows} results
          </span>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm text-slate-600">
            <span>Page {totalPages > 0 ? currentPage : 0} of {totalPages}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className={cn(
                "h-9 px-3 rounded-lg border-2 border-slate-200/60",
                "bg-gradient-to-r from-slate-50 to-blue-50/30",
                "hover:border-blue-300/60 hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-indigo-50/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200 shadow-sm hover:shadow-md",
                "text-slate-700 font-medium"
              )}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className={cn(
                "h-9 px-3 rounded-lg border-2 border-slate-200/60",
                "bg-gradient-to-r from-slate-50 to-blue-50/30",
                "hover:border-blue-300/60 hover:bg-gradient-to-r hover:from-blue-50/40 hover:to-indigo-50/30",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "transition-all duration-200 shadow-sm hover:shadow-md",
                "text-slate-700 font-medium"
              )}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
