import {
  markDeceasedFormAction,
  moveOutResidentFormAction,
  restoreLivingFormAction,
  transferResidentFormAction,
} from "@/features/residents/actions";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/submit-button";
import { NativeSelect } from "@/components/ui/native-select";

export function ResidencyActions({
  id,
  currentHouseholdId,
  households,
  movedOut,
  deceased,
}: {
  id: string;
  currentHouseholdId: string;
  households: { id: string; householdNumber: string }[];
  movedOut: boolean;
  deceased: boolean;
}) {
  return (
    <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
      {deceased ? (
        <form action={restoreLivingFormAction} className="space-y-2 md:col-span-2">
          <input type="hidden" name="id" value={id} />
          <p className="font-medium">Marked deceased</p>
          <p className="text-xs text-muted-foreground">
            This person is excluded from voter counts and household members.
            Restore only if this was recorded by mistake.
          </p>
          <SubmitButton variant="outline">Restore as living</SubmitButton>
        </form>
      ) : (
        <>
          {!movedOut ? (
            <form action={moveOutResidentFormAction} className="space-y-2">
              <input type="hidden" name="id" value={id} />
              <p className="font-medium">Mark as moved out</p>
              <p className="text-xs text-muted-foreground">
                Use this when the person no longer lives in this house. They stay in
                the records but drop out of the current household count.
              </p>
              <Label htmlFor="movedOutNote">Where / why they left</Label>
              <Textarea
                id="movedOutNote"
                name="movedOutNote"
                required
                placeholder="Moved to another barangay, new address, etc."
              />
              <SubmitButton variant="destructive">Move out</SubmitButton>
            </form>
          ) : (
            <p className="text-sm text-muted-foreground">
              This person is marked moved out. Transfer them below if they now live
              in another household in this barangay.
            </p>
          )}
          <form action={transferResidentFormAction} className="space-y-2">
            <input type="hidden" name="id" value={id} />
            <p className="font-medium">{movedOut ? "Move in / transfer" : "Transfer household"}</p>
            <Label htmlFor="householdId">New household</Label>
            <NativeSelect
              id="householdId"
              name="householdId"
              required
              defaultValue={currentHouseholdId}
              className="w-full"
            >
              {households.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.householdNumber}
                </option>
              ))}
            </NativeSelect>
            <Label htmlFor="relation">Relation in the new household</Label>
            <NativeSelect id="relation" name="relation" className="w-full">
              <option value="MEMBER">Registered member</option>
              <option value="BOARDER">Boarder / nakikitira</option>
            </NativeSelect>
            <SubmitButton>Save transfer</SubmitButton>
          </form>
          <form action={markDeceasedFormAction} className="space-y-2 md:col-span-2">
            <input type="hidden" name="id" value={id} />
            <p className="font-medium">Mark as deceased</p>
            <p className="text-xs text-muted-foreground">
              Removes them from voter counts, household members, and living
              resident reports.
            </p>
            <Label htmlFor="deathNote">Cause / source of report</Label>
            <Textarea
              id="deathNote"
              name="deathNote"
              required
              placeholder="Death certificate, family report, date and place if known"
            />
            <SubmitButton variant="destructive">Record death</SubmitButton>
          </form>
        </>
      )}
    </div>
  );
}
