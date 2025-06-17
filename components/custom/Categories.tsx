"use client"

import { Category } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Tag, Sparkles } from "lucide-react";

interface CategoriesProps {
  categories: Category[];
  selectedCategory: string | null;
}

const Categories = ({ categories, selectedCategory }: CategoriesProps) => {
  const router = useRouter();

  const onClick = (categoryId: string | null) => {
    router.push(categoryId ? `/categories/${categoryId}` : "/");
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      <Button
        variant={selectedCategory === null ? "default" : "outline"}
        onClick={() => onClick(null)}
        className={`
          px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105
          ${
            selectedCategory === null
              ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              : "border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-600"
          }
        `}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        All Categories
      </Button>
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? "default" : "outline"}
          onClick={() => onClick(category.id)}
          className={`
            px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105
            ${
              selectedCategory === category.id
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                : "border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 hover:text-blue-600"
            }
          `}
        >
          <Tag className="w-4 h-4 mr-2" />
          {category.name}
        </Button>
      ))}
    </div>
  );
};

export default Categories;
