"use client";

import { Course } from "@prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Pencil, ArrowUpDown, DollarSign, Eye, BookOpen } from "lucide-react";
import Link from "next/link";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 font-semibold"
        >
          <BookOpen className="mr-2 h-4 w-4 text-blue-600" />
          Course Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <div className="font-medium text-slate-800 hover:text-blue-700 transition-colors duration-300 max-w-xs">
          <div className="truncate" title={title}>
            {title}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 font-semibold"
        >
          <DollarSign className="mr-2 h-4 w-4 text-blue-600" />
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      const formatted = new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
      }).format(price);

      return (
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
            <span className="text-xs font-bold text-green-600">Rs</span>
          </div>
          <span className="font-semibold text-slate-800">{formatted}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-300 font-semibold"
        >
          <Eye className="mr-2 h-4 w-4 text-blue-600" />
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const isPublished = row.getValue("isPublished") || false;

      return (
        <Badge
          className={`font-semibold transition-all duration-300 ${
            isPublished
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-lg"
              : "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-600 hover:from-slate-200 hover:to-slate-300"
          }`}
        >
          {isPublished ? "Published" : "Draft"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Link
        href={`/instructor/courses/${row.original.id}/basic`}
        className="group flex gap-2 items-center px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 text-blue-600 hover:text-blue-700 font-medium"
      >
        <div className="p-1 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-300">
          <Pencil className="h-3 w-3" />
        </div>
        <span>Edit Course</span>
        <div className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-2 h-2 border-r-2 border-b-2 border-blue-600 transform rotate-[-45deg]" />
        </div>
      </Link>
    ),
  },
];
