import { getEntry } from "../db.js";

interface Hunk {
  startA: number;
  startB: number;
  lines: string[];
}

export function handleDiff(
  handleA: string,
  handleB: string,
  contextLines: number = 3,
): {
  summary: string;
  additions: number;
  deletions: number;
  hunks: Hunk[];
} {
  const entryA = getEntry(handleA);
  if (!entryA) throw new Error(`Entry not found: ${handleA}`);
  const entryB = getEntry(handleB);
  if (!entryB) throw new Error(`Entry not found: ${handleB}`);

  const linesA = entryA.content.split("\n");
  const linesB = entryB.content.split("\n");

  // Compute LCS table
  const m = linesA.length;
  const n = linesB.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (linesA[i - 1] === linesB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to produce diff operations
  const ops: Array<{ type: "equal" | "delete" | "add"; lineA: number; lineB: number; text: string }> = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      ops.push({ type: "equal", lineA: i - 1, lineB: j - 1, text: linesA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      ops.push({ type: "add", lineA: i, lineB: j - 1, text: linesB[j - 1] });
      j--;
    } else {
      ops.push({ type: "delete", lineA: i - 1, lineB: j, text: linesA[i - 1] });
      i--;
    }
  }
  ops.reverse();

  // Group changes into hunks with context
  let additions = 0;
  let deletions = 0;
  const changeIndices: number[] = [];
  for (let idx = 0; idx < ops.length; idx++) {
    if (ops[idx].type === "add") {
      additions++;
      changeIndices.push(idx);
    } else if (ops[idx].type === "delete") {
      deletions++;
      changeIndices.push(idx);
    }
  }

  if (changeIndices.length === 0) {
    return { summary: "No differences found", additions: 0, deletions: 0, hunks: [] };
  }

  // Merge change indices into ranges with context
  const ranges: Array<[number, number]> = [];
  let rangeStart = Math.max(0, changeIndices[0] - contextLines);
  let rangeEnd = Math.min(ops.length - 1, changeIndices[0] + contextLines);

  for (let ci = 1; ci < changeIndices.length; ci++) {
    const newStart = Math.max(0, changeIndices[ci] - contextLines);
    const newEnd = Math.min(ops.length - 1, changeIndices[ci] + contextLines);
    if (newStart <= rangeEnd + 1) {
      rangeEnd = newEnd;
    } else {
      ranges.push([rangeStart, rangeEnd]);
      rangeStart = newStart;
      rangeEnd = newEnd;
    }
  }
  ranges.push([rangeStart, rangeEnd]);

  const hunks: Hunk[] = ranges.slice(0, 5).map(([start, end]) => {
    const hunkLines: string[] = [];
    let startA = -1;
    let startB = -1;
    for (let idx = start; idx <= end; idx++) {
      const op = ops[idx];
      if (startA === -1) {
        startA = op.lineA;
        startB = op.lineB;
      }
      if (op.type === "equal") {
        hunkLines.push(` ${op.text}`);
      } else if (op.type === "delete") {
        hunkLines.push(`-${op.text}`);
      } else {
        hunkLines.push(`+${op.text}`);
      }
    }
    return { startA, startB, lines: hunkLines };
  });

  return {
    summary: `${additions} additions, ${deletions} deletions across ${ranges.length} hunks`,
    additions,
    deletions,
    hunks,
  };
}
