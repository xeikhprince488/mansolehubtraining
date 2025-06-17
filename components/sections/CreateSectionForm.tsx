"use client";

import { Course, Section } from "@prisma/client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";
import axios from "axios";
import SectionList from "@/components/sections/SectionList";
import { 
  Loader2, 
  BookOpen, 
  Layers, 
  Plus, 
  FileText, 
  ArrowLeft,
  Save
} from "lucide-react";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title is required and must be at least 2 characters long",
  }),
});

const CreateSectionForm = ({
  course,
}: {
  course: Course & { sections: Section[] };
}) => {
  const pathname = usePathname();
  const router = useRouter();

  const routes = [
    {
      label: "Basic Information",
      path: `/instructor/courses/${course.id}/basic`,
      icon: BookOpen,
    },
    { 
      label: "Curriculum", 
      path: `/instructor/courses/${course.id}/sections`,
      icon: Layers,
    },
  ];

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post(
        `/api/courses/${course.id}/sections`,
        values
      );
      router.push(
        `/instructor/courses/${course.id}/sections/${response.data.id}`
      );
      toast.success("New Section created!");
    } catch (err) {
      toast.error("Something went wrong!");
      console.log("Failed to create a new section", err);
    }
  };

  const onReorder = async (updateData: { id: string; position: number }[]) => {
    try {
      await axios.put(`/api/courses/${course.id}/sections/reorder`, {
        list: updateData,
      });
      toast.success("Sections reordered successfully");
    } catch (err) {
      console.log("Failed to reorder sections", err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Course Management</h3>
          <div className="flex gap-2">
            {routes.map((route) => {
              const Icon = route.icon;
              const isActive = pathname === route.path;
              return (
                <Link key={route.path} href={route.path}>
                  <Button 
                    variant={isActive ? "default" : "outline"}
                    className={`
                      flex items-center gap-2 transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg' 
                        : 'hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {route.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Existing Sections */}
      {course.sections && course.sections.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">Course Sections</h3>
                <p className="text-slate-600 text-sm">Manage and reorder your course content</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <SectionList
              items={course.sections || []}
              onReorder={onReorder}
              onEdit={(id) =>
                router.push(`/instructor/courses/${course.id}/sections/${id}`)
              }
            />
          </div>
        </div>
      )}

      {/* Add New Section Form */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-800">Add New Section</h3>
              <p className="text-slate-600 text-sm">Create a new section to organize your course content</p>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-700 font-medium flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      Section Title
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Introduction to Web Development" 
                        className="h-12 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 pt-4 border-t border-slate-200">
                <Link href={`/instructor/courses/${course.id}/basic`}>
                  <Button 
                    variant="outline" 
                    type="button"
                    className="h-12 px-6 border-slate-300 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Basic Info
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={!isValid || isSubmitting}
                  className="h-12 px-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Create Section
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      {/* Empty State for No Sections */}
      {(!course.sections || course.sections.length === 0) && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-dashed border-blue-200 p-12 text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mx-auto mb-4">
            <Layers className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Sections Yet</h3>
          <p className="text-slate-600 mb-4 max-w-md mx-auto">
            Start building your course by creating your first section. Sections help organize your content into logical chapters.
          </p>
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">Create your first section above</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateSectionForm;
