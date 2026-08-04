"use client";

import {
  BooksInvestigationMatrix,
  type MatrixRow,
} from "@/components/books/books-investigation-matrix";
import { BooksConceptFilter } from "@/components/books/books-concept-filter";

type BooksArchiveMatrixSectionProps = {
  rows: MatrixRow[];
  concepts: string[];
};

/**
 * Client wrapper: concept filter + dense matrix for /books.
 */
export function BooksArchiveMatrixSection({
  rows,
  concepts,
}: BooksArchiveMatrixSectionProps) {
  return (
    <BooksConceptFilter concepts={concepts}>
      {(active) => (
        <BooksInvestigationMatrix rows={rows} activeConcept={active} />
      )}
    </BooksConceptFilter>
  );
}
