import { getAllCategories } from "@/lib/queries/categories";
import { CategoryCard } from "@/components/categories/category-card";

export const metadata = {
  title: "Categories | Social Ills Tracker",
  description: "Browse social ills by category.",
};

export default function CategoriesPage() {
  const categories = getAllCategories();

  return (
    <div className="container mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Categories</h1>
        <p className="text-muted-foreground">
          Eight domains where structural harms concentrate.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
      </div>
    </div>
  );
}
