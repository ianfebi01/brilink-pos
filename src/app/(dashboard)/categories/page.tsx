import { getCategories } from "@/actions/categories";
import { CategoryTable } from "@/components/features/categories/category-table";
import { CategoryFormDialog } from "@/components/features/categories/category-form-dialog";

export default async function CategoriesPage() {
  const { categories = [] } = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kategori Transaksi</h2>
          <p className="text-muted-foreground">
            Kelola kategori transaksi untuk memisahkan jenis transaksi dan aturan fee.
          </p>
        </div>
        <CategoryFormDialog />
      </div>
      <CategoryTable categories={categories} />
    </div>
  );
}
