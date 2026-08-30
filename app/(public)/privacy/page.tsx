import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy notice" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 prose prose-slate dark:prose-invert">
      <h1 className="font-serif text-3xl font-semibold">Privacy notice</h1>
      <p className="text-muted-foreground">
        This system processes personal information under the Data Privacy Act of
        2012 (Republic Act No. 10173).
      </p>
      <h2 className="mt-8 text-xl font-semibold">What we collect</h2>
      <p>
        Name, birthdate, address, contact number, household membership, civil
        status, special-category tags (Senior, PWD, Solo Parent), identity
        documents you upload, document requests, and complaints you submit.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Why we collect it</h2>
      <p>
        To maintain the barangay resident registry, issue official certifications,
        verify identity, and respond to service requests. Processing is for a
        lawful public function of the barangay.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Who can see it</h2>
      <p>
        Residents see their own household records. Authorized barangay staff see
        operational queues. Administrators manage users, settings, and audit
        logs. Public QR verification shows only a name, verification badge, and
        purok — not contact details or identity documents.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Retention and rights</h2>
      <p>
        Records are kept while you reside in the barangay and as required for
        official archives. You may request access or correction through the
        barangay hall. This software is a tool; the barangay remains the personal
        information controller.
      </p>
    </article>
  );
}
