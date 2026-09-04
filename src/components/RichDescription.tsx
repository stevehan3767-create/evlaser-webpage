const SEPARATOR_RE = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/;
const HEADING_RE = /^\[(.+)\]$/;
const LIST_ITEM_RE = /^[-•]\s+(.*)$/;

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

type Block =
  | { type: "p"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "table"; header: string[]; rows: string[][] };

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
    const trimmed = line.trim();
    const isTableStart = trimmed.startsWith("|") && i + 1 < lines.length && SEPARATOR_RE.test(lines[i + 1].trim());
    const headingMatch = trimmed.match(HEADING_RE);

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

    if (headingMatch) {
      flushParagraph();
      blocks.push({ type: "heading", text: headingMatch[1] });
      continue;
    }

    if (LIST_ITEM_RE.test(trimmed)) {
      flushParagraph();
      const items: string[] = [trimmed.match(LIST_ITEM_RE)![1]];
      while (i + 1 < lines.length && LIST_ITEM_RE.test(lines[i + 1].trim())) {
        i += 1;
        items.push(lines[i].trim().match(LIST_ITEM_RE)![1]);
      }
      blocks.push({ type: "list", items });
      continue;
    }

    if (trimmed === "") {
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
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h3 key={i} className="text-[15px] font-bold text-ink pt-1 first:pt-0">
              {block.text}
            </h3>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="flex flex-col gap-1.5">
              {block.items.map((item, ii) => (
                <li
                  key={ii}
                  className="text-ink-soft text-[14px] leading-relaxed pl-4 relative before:content-['—'] before:absolute before:left-0 before:text-blue"
                >
                  {item}
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "table") {
          return (
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
          );
        }
        return (
          <p key={i} className="text-ink-soft text-[14.5px] leading-relaxed whitespace-pre-wrap">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
