import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { countResidentsSql, listResidentsSql } from "@/lib/resident-sql";
import { ListPagination } from "@/components/list-pagination";
import { paginationFromSearch, paginationMeta } from "@/lib/pagination";
import { effectiveVoterStatus, yearsOld } from "@/lib/age";
import {
  formatResidentName,
  LIFE_STATUS_LABELS,
  RELATION_LABELS,
  RESIDENCY_LABELS,
} from "@/lib/constants";
import { NativeSelect } from "@/components/ui/native-select";

export default async function ResidentsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    tag?: string;
    relation?: string;
    residency?: string;
    life?: string;
    page?: string;
    pageSize?: string;
  }>;
}) {
  const { q, status, tag, relation, residency, life, page, pageSize } = await searchParams;
  const paging = paginationFromSearch({ page, pageSize });
  const total = await countResidentsSql({ q, status, tag, relation, residency, life });
  const meta = paginationMeta(total, paging.page, paging.pageSize);
  const rows = await listResidentsSql({
    q,
    status,
    tag,
    relation,
    residency,
    life,
    skip: meta.skip,
    take: meta.take,
  });
  const query = { q, status, tag, relation, residency, life };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl font-semibold">Residents</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/staff/residents/verify">Verification queue</Link>
          </Button>
          <Button asChild>
            <Link href="/staff/residents/new">Add resident</Link>
          </Button>
        </div>
      </div>
      <form className="flex flex-wrap gap-2">
        <input type="hidden" name="pageSize" value={String(meta.pageSize)} />
        <Input name="q" placeholder="Search name or household" defaultValue={q} className="max-w-xs" />
        <NativeSelect name="status" defaultValue={status ?? ""}>
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="VERIFIED">Verified</option>
          <option value="REJECTED">Rejected</option>
          <option value="UNVERIFIED">Unverified</option>
        </NativeSelect>
        <NativeSelect name="tag" defaultValue={tag ?? ""}>
          <option value="">All sectors</option>
          <option value="senior">Senior</option>
          <option value="pwd">PWD</option>
          <option value="solo">Solo parent</option>
          <option value="voter">Regular voters</option>
          <option value="sk">SK voters</option>
        </NativeSelect>
        <NativeSelect name="relation" defaultValue={relation ?? ""}>
          <option value="">All relations</option>
          <option value="MEMBER">Registered members</option>
          <option value="BOARDER">Boarders / nakikitira</option>
        </NativeSelect>
        <NativeSelect name="residency" defaultValue={residency ?? ""}>
          <option value="">Living + moved out</option>
          <option value="ACTIVE">Living here</option>
          <option value="MOVED_OUT">Moved out</option>
        </NativeSelect>
        <NativeSelect name="life" defaultValue={life ?? ""}>
          <option value="">Living + deceased</option>
          <option value="ALIVE">Living</option>
          <option value="DECEASED">Deceased</option>
        </NativeSelect>
        <Button type="submit" variant="secondary">
          Filter
        </Button>
      </form>
      {rows.length === 0 ? (
        <EmptyState title="No residents match" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Age</TableHead>
              <TableHead>Household</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => {
              const vote = effectiveVoterStatus(r, r.birthdate);
              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <Link href={`/staff/residents/${r.id}`} className="text-primary">
                      {formatResidentName(r)}
                    </Link>
                  </TableCell>
                  <TableCell>{yearsOld(r.birthdate)}</TableCell>
                  <TableCell>
                    {r.householdNumber} · {r.purok}
                  </TableCell>
                  <TableCell className="space-x-1">
                    <Badge variant="outline">{RELATION_LABELS[r.relation]}</Badge>
                    <Badge variant="outline">{RESIDENCY_LABELS[r.residencyStatus]}</Badge>
                    {r.lifeStatus === "DECEASED" ? (
                      <Badge className="bg-zinc-200 text-zinc-800">{LIFE_STATUS_LABELS.DECEASED}</Badge>
                    ) : null}
                    {vote.regular ? <Badge variant="outline">Voter</Badge> : null}
                    {vote.sk ? <Badge variant="outline">SK</Badge> : null}
                    {r.isSenior ? <Badge variant="outline">Senior</Badge> : null}
                    {r.isPwd ? <Badge variant="outline">PWD</Badge> : null}
                    {r.isSoloParent ? <Badge variant="outline">Solo parent</Badge> : null}
                  </TableCell>
                  <TableCell>
                    <StatusBadge value={r.verificationStatus} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
      <ListPagination
        pathname="/staff/residents"
        query={query}
        page={meta.page}
        pageSize={meta.pageSize}
        total={total}
      />
    </div>
  );
}
