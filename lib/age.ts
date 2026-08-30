/** SK voting age under RA 10742 as amended by RA 11768. */
export const SK_VOTER_MIN = 15;
export const SK_VOTER_MAX = 30;
export const REGULAR_VOTER_MIN = 18;

export function yearsOld(birthdate: Date, on = new Date()) {
  let age = on.getFullYear() - birthdate.getFullYear();
  const monthDiff = on.getMonth() - birthdate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && on.getDate() < birthdate.getDate())) {
    age -= 1;
  }
  return age;
}

export function isSkAge(age: number) {
  return age >= SK_VOTER_MIN && age <= SK_VOTER_MAX;
}

export function isRegularVoterAge(age: number) {
  return age >= REGULAR_VOTER_MIN;
}

/** Parse `YYYY-MM-DD` as a local date so age is not off by a timezone day. */
export function parseBirthdate(value: string | Date) {
  if (value instanceof Date) return value;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month ?? 1) - 1, day ?? 1);
}

export function voterAgeErrors(birthdate: string | Date, flags: {
  isSkVoter?: boolean;
  isRegisteredVoter?: boolean;
}) {
  const age = yearsOld(parseBirthdate(birthdate));
  const errors: string[] = [];
  if (flags.isSkVoter && age < SK_VOTER_MIN) {
    errors.push(
      `SK voters must be at least ${SK_VOTER_MIN}. This person is ${age}.`,
    );
  }
  if (flags.isRegisteredVoter && !isRegularVoterAge(age)) {
    errors.push(
      `Regular voters must be ${REGULAR_VOTER_MIN} or older. This person is ${age}.`,
    );
  }
  return errors;
}

/** Counts follow birthday — staff does not need to retag. */
export function effectiveVoterStatus(
  flags: { isSkVoter?: boolean; isRegisteredVoter?: boolean },
  birthdate: string | Date,
) {
  const age = yearsOld(parseBirthdate(birthdate));
  const markedSk = Boolean(flags.isSkVoter);
  const markedRegular = Boolean(flags.isRegisteredVoter);
  return {
    age,
    sk: markedSk && isSkAge(age),
    regular: isRegularVoterAge(age) && (markedRegular || markedSk),
  };
}
