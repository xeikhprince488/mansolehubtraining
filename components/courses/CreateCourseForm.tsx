"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import { BookOpen, Sparkles, ArrowRight, Loader2, GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ComboBox } from "@/components/custom/ComboBox";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title is required and minimum 2 characters",
  }),
  categoryId: z.string().min(1, {
    message: "Category is required",
  }),
  subCategoryId: z.string().min(1, {
    message: "Subcategory is required",
  }),
});

interface CreateCourseFormProps {
  categories: {
    label: string; // name of category
    value: string; // categoryId
    subCategories: { label: string; value: string }[];
  }[];
}

const CreateCourseForm = ({ categories }: CreateCourseFormProps) => {
  const router = useRouter();

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      categoryId: "",
      subCategoryId: "",
    },
  });

  const { isValid, isSubmitting } = form.formState;

  // 2. Define a submit handler.
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/courses", values);
      router.push(`/instructor/courses/${response.data.id}/basic`);
      toast.success("New Course Created");
    } catch (err) {
      console.log("Failed to create new course", err);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mx-auto mb-6">
              <GraduationCap className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Create Your Course
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Share your knowledge and inspire learners worldwide. Start building your educational masterpiece today.
            </p>
            
            {/* Feature highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <BookOpen className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Structured Learning</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <Sparkles className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Engaging Content</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <GraduationCap className="h-6 w-6 mx-auto mb-2" />
                <div className="text-sm font-medium">Global Reach</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Section */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Course Basics
                </h2>
                <p className="text-slate-600 mt-1">
                  Let&apos;s start with the fundamentals of your course
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* Helpful tip */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Pro Tip</h3>
                  <p className="text-blue-700 text-sm leading-relaxed">
                    Don&apos;t worry about perfection! You can always refine your course title and category later. 
                    Focus on capturing the essence of what you want to teach.
                  </p>
                </div>
              </div>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Course Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-blue-600" />
                        Course Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Complete Web Development Bootcamp for Beginners"
                          className="h-12 text-lg border-2 border-slate-200 focus:border-blue-500 rounded-xl transition-all duration-200"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-slate-600">
                        Choose a clear, descriptive title that tells students exactly what they&apos;ll learn
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Category Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-lg font-semibold text-slate-800">
                          Category
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <ComboBox 
                              options={categories} 
                              {...field} 
                              className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl"
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-slate-600">
                          Select the main subject area
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subCategoryId"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-lg font-semibold text-slate-800">
                          Subcategory
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <ComboBox
                              options={
                                categories.find(
                                  (category) =>
                                    category.value === form.watch("categoryId")
                                )?.subCategories || []
                              }
                              {...field}
                              className="h-12 border-2 border-slate-200 focus:border-blue-500 rounded-xl"
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-slate-600">
                          Choose a specific topic within the category
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <Button 
                    type="submit" 
                    disabled={!isValid || isSubmitting}
                    className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Creating Your Course...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span>Create Course</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    )}
                  </Button>
                  
                  {!isValid && (
                    <p className="text-center text-slate-500 text-sm mt-3">
                      Please fill in all required fields to continue
                    </p>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <p className="text-slate-600">
            Need help getting started? Check out our 
            <span className="text-blue-600 font-medium cursor-pointer hover:underline"> course creation guide</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CreateCourseForm;
