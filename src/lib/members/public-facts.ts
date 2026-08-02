/**
 * Public-facing investigation facts (allowed outside /members).
 * Neutral voice. No subscriber count. No club member count.
 */

import { MEMBERS_STATIC_PROOF } from "@/lib/members/static-proof";

export type PublicFact = {
  id: string;
  label: string;
  value: string;
  hint?: string;
};

const proof = MEMBERS_STATIC_PROOF;

/** Compact authority numbers for home / videos / concepts / paths. */
export const PUBLIC_INVESTIGATION_FACTS: PublicFact[] = [
  {
    id: "hours",
    label: "שעות במאגר",
    value: `${proof.libraryHoursMin}+`,
    hint: "שעות חקירה ושיחות עומק",
  },
  {
    id: "concepts",
    label: "מושגים שפורקו",
    value: `${proof.conceptsExploredMin}+`,
    hint: "מושגי יסוד שעברו חקירה יסודית",
  },
  {
    id: "levels",
    label: "רמות חקירה",
    value: String(proof.investigationLevels),
    hint: "מהבסיס עד הפירוק הגולמי",
  },
  {
    id: "since",
    label: "פעיל מאז",
    value: String(proof.activeSinceYear),
    hint: proof.activeSinceLabel,
  },
  {
    id: "views",
    label: "צפיות בחקירה",
    value: "200,000+",
    hint: "מעל 200,000 צפיות בחקירה",
  },
];

export function publicFactsLine(): string {
  return [
    `במאגר יש ${proof.libraryHoursMin}+ שעות חקירה`,
    `מעל ${proof.conceptsExploredMin} מושגים שפורקו`,
    `${proof.investigationLevels} רמות חקירה`,
    `פעיל מאז ${proof.activeSinceYear}`,
    "מעל 200,000 צפיות בחקירה",
  ].join(" · ");
}
