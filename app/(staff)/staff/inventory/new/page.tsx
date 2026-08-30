import { InventoryForm } from "@/features/inventory/inventory-form";

export default function NewInventoryItemPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Add inventory item</h1>
      <InventoryForm />
    </div>
  );
}
