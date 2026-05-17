import { getCategories } from "@/actions/categories";
import { CategoryTable } from "@/components/features/categories/category-table";
import { CategoryFormDialog } from "@/components/features/categories/category-form-dialog";
import { TransitionWrapper } from "@/components/layout/transition-wrapper";

export default async function CategoriesPage() {
  const { categories = [] } = await getCategories();

  return (
    <TransitionWrapper>
      <div className="space-y-6">
        <div className="animate-item flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Kategori Transaksi</h2>
            <p className="text-muted-foreground">
              Kelola kategori transaksi untuk memisahkan jenis transaksi dan aturan fee.
            </p>
          </div>
          <CategoryFormDialog />
        </div>
        <div className="animate-item">
          <CategoryTable categories={categories} />
        </div>
      </div>
    </TransitionWrapper>
  );
}
