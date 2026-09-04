const SEPARATOR_RE = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/;

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

type Block = { type: "p"; text: string } | { type: "table"; header: string[]; rows: string[][] };

function parseBlocks(text: string): Block[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: "p", text: paragraph.join("\n") });
      paragraph = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isTableStart = line.trim().startsWith("|") && i + 1 < lines.length && SEPARATOR_RE.test(lines[i + 1].trim());

    if (isTableStart) {
      flushParagraph();
      const header = splitRow(line);
      i += 1; // skip separator row
      const rows: string[][] = [];
      while (i + 1 < lines.length && lines[i + 1].trim().startsWith("|")) {
        i += 1;
        rows.push(splitRow(lines[i]));
      }
      blocks.push({ type: "table", header, rows });
      continue;
    }

    if (line.trim() === "") {
      flushParagraph();
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();
  return blocks;
}

export default function RichDescription({ text }: { text: string }) {
  const blocks = parseBlocks(text);

  return (
    <div className="flex flex-col gap-5">
      {blocks.map((block, i) =>
        block.type === "table" ? (
          <div key={i} className="overflow-x-auto border border-line-strong">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-surface-alt">
                  {block.header.map((h, hi) => (
                    <th key={hi} className="text-left font-bold px-3.5 py-2.5 border-b border-line-strong whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-line last:border-b-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3.5 py-2.5 text-ink-soft align-top">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p key={i} className="text-ink-soft text-[14.5px] leading-relaxed whitespace-pre-wrap">
            {block.text}
          </p>
        )
      )}
    </div>
  );
}
