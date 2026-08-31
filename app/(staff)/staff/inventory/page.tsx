import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { NativeSelect } from "@/components/ui/native-select";
import { countInventoryItems, listInventoryItems } from "@/lib/inventory-sql";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";
import {
  INVENTORY_CATEGORY_LABELS,
  INVENTORY_CONDITION_LABELS,
} from "@/lib/constants";
import { deleteInventoryItemFormAction } from "@/features/inventory/actions";
import { FeedbackForm } from "@/components/feedback-form";
import { SubmitButton } from "@/components/submit-button";

export default async function StaffInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    condition?: string;
    page?: string;
    pageSize?: string;
  }>;
}) {
  const { q, category, condition, page, pageSize } = await searchParams;
  const paging = paginationFromSearch({ page, pageSize });
  const total = await countInventoryItems({ q, category, condition });
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const rows = await listInventoryItems({
    q,
    category,
    condition,
    skip: meta.skip,
    take: meta.take,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Inventory</h1>
          <p className="text-sm text-muted-foreground">
            Kagamitan ng barangay — chairs, tents, sound system, vehicles, and
            rescue gear. Staff only.
          </p>
        </div>
        <Button asChild>
          <Link href="/staff/inventory/new">Add item</Link>
        </Button>
      </div>
      <form className="flex flex-wrap gap-2">
        <input type="hidden" name="pageSize" value={String(meta.pageSize)} />
        <Input
          name="q"
          placeholder="Search name, location, property no."
          defaultValue={q}
          className="max-w-xs"
        />
        <NativeSelect name="category" defaultValue={category ?? ""}>
          <option value="">All categories</option>
          <option value="FURNITURE">Furniture</option>
          <option value="EVENT">Event / tents</option>
          <option value="AUDIO_VISUAL">Sound / lights</option>
          <option value="VEHICLE">Vehicle</option>
          <option value="COMMUNICATION">Radio / comms</option>
          <option value="DISASTER">Disaster / rescue</option>
          <option value="SPORTS">Sports</option>
          <option value="OFFICE">Office</option>
          <option value="OTHER">Other</option>
        </NativeSelect>
        <NativeSelect name="condition" defaultValue={condition ?? ""}>
          <option value="">All conditions</option>
          <option value="GOOD">Good</option>
          <option value="FAIR">Fair</option>
          <option value="NEEDS_REPAIR">Needs repair</option>
          <option value="UNUSABLE">Unusable</option>
        </NativeSelect>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>
      {rows.length === 0 ? (
        <EmptyState title="No items match" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((item) => {
              const available = item.quantity - item.quantityOut;
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link href={`/staff/inventory/${item.id}`} className="text-primary">
                      {item.name}
                    </Link>
                    {item.propertyNumber ? (
                      <p className="text-xs text-muted-foreground">{item.propertyNumber}</p>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {
                        INVENTORY_CATEGORY_LABELS[
                          item.category as keyof typeof INVENTORY_CATEGORY_LABELS
                        ]
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {available} / {item.quantity}
                    {item.quantityOut > 0 ? (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({item.quantityOut} out)
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={
                        item.condition === "NEEDS_REPAIR" || item.condition === "UNUSABLE"
                          ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200"
                          : undefined
                      }
                    >
                      {
                        INVENTORY_CONDITION_LABELS[
                          item.condition as keyof typeof INVENTORY_CONDITION_LABELS
                        ]
                      }
                    </Badge>
                  </TableCell>
                  <TableCell>{item.location ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/staff/inventory/${item.id}`}>Update</Link>
                      </Button>
                      <FeedbackForm action={deleteInventoryItemFormAction}>
                        <input type="hidden" name="id" value={item.id} />
                        <SubmitButton variant="ghost">Delete</SubmitButton>
                      </FeedbackForm>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <ListPagination
        pathname="/staff/inventory"
        query={{ q, category, condition }}
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
