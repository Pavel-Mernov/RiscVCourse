type InlinePart =
    | string
    | { code: string };

type BlockPart =
    | string
    | { code: string }
    | { ul: UlItem[] };

type UlItem =
    | string
    | InlinePart[]
    | { code: string };

export function parseText(input: string): BlockPart[] {
    const lines = input
        .split("\n")
        .map(l => l.trimEnd());

    const result: BlockPart[] = [];

    let i = 0;

    while (i < lines.length) {
        const line = lines[i].trim();

        // пустая строка
        if (!line) {
            i++;
            continue;
        }

        // multiline code block
        if (line.startsWith("<code>")) {
            const codeLines: string[] = [];

            let first = line.replace(/^<code>/, "");

            // однострочный <code>...</code>
            if (first.includes("</code>")) {
                const [content] = first.split("</code>");

                result.push({
                    code: content.trim()
                });

                i++;
                continue;
            }

            // многострочный
            if (first.trim()) {
                codeLines.push(first);
            }

            i++;

            while (i < lines.length) {
                const current = lines[i];

                if (current.includes("</code>")) {
                    const before = current.split("</code>")[0];

                    if (before.length) {
                        codeLines.push(before);
                    }

                    break;
                }

                codeLines.push(current);

                i++;
            }

            result.push({
                code: codeLines.join("\n").trim()
            });

            i++;
            continue;
        }

        // UL block
        if (line.startsWith("* ")) {
            const items: UlItem[] = [];

            while (
                i < lines.length &&
                lines[i].trim().startsWith("* ")
            ) {
                const rawItem = lines[i]
                    .trim()
                    .slice(2);

                // multiline code item
                if (rawItem === "<code>") {
                    const codeLines: string[] = [];

                    i++;

                    while (i < lines.length) {
                        const current = lines[i];

                        if (current.includes("</code>")) {
                            const before = current.split("</code>")[0];

                            if (before.length) {
                                codeLines.push(before);
                            }

                            break;
                        }

                        codeLines.push(current);

                        i++;
                    }

                    items.push({
                        code: codeLines.join("\n").trim()
                    });

                    i++;
                    continue;
                }

                const parsedInline = parseInline(rawItem);

                if (
                    parsedInline.length === 1 &&
                    typeof parsedInline[0] === "string"
                ) {
                    items.push(parsedInline[0]);
                } else {
                    items.push(parsedInline);
                }

                i++;
            }

            result.push({
                ul: items
            });

            continue;
        }

        // обычный текст
        result.push(line);

        i++;
    }

    return result;
}

function parseInline(text: string): InlinePart[] {
    const result: InlinePart[] = [];

    const regex = /<code>(.*?)<\/code>/gs;

    let lastIndex = 0;

    for (const match of text.matchAll(regex)) {
        const index = match.index ?? 0;

        const before = text.slice(lastIndex, index).trim();

        if (before) {
            result.push(before);
        }

        result.push({
            code: match[1].trim()
        });

        lastIndex = index + match[0].length;
    }

    const tail = text.slice(lastIndex).trim();

    if (tail) {
        result.push(tail);
    }

    return result;
}