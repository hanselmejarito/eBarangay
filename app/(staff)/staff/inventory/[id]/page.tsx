import { notFound } from "next/navigation";
import { InventoryForm } from "@/features/inventory/inventory-form";
import { getInventoryItem } from "@/lib/inventory-sql";

export default async function EditInventoryItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getInventoryItem(id);
  if (!item) notFound();

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl font-semibold">Update inventory item</h1>
      <InventoryForm
        id={item.id}
        defaults={{
          name: item.name,
          category: item.category,
          quantity: item.quantity,
          quantityOut: item.quantityOut,
          condition: item.condition,
          location: item.location,
          propertyNumber: item.propertyNumber,
          notes: item.notes,
        }}
      />
    </div>
  );
}
