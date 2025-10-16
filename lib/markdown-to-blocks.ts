interface NotionBlock {
  object: "block"
  type: string
  [key: string]: any
}

export function markdownToBlocks(markdown: string): NotionBlock[] {
  const lines = markdown.split("\n")
  const blocks: NotionBlock[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Skip empty lines
    if (!line.trim()) {
      i++
      continue
    }

    // Headings
    if (line.startsWith("# ")) {
      blocks.push(createHeading(line.slice(2), 1))
    } else if (line.startsWith("## ")) {
      blocks.push(createHeading(line.slice(3), 2))
    } else if (line.startsWith("### ")) {
      blocks.push(createHeading(line.slice(4), 3))
    }
    // Bullet list
    else if (line.match(/^[-*+]\s/)) {
      blocks.push(createBulletedListItem(line.replace(/^[-*+]\s/, "")))
    }
    // Numbered list
    else if (line.match(/^\d+\.\s/)) {
      blocks.push(createNumberedListItem(line.replace(/^\d+\.\s/, "")))
    }
    // Equation block
    else if (line.startsWith("$$")) {
      const equationLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("$$")) {
        equationLines.push(lines[i])
        i++
      }
      blocks.push(createEquationBlock(equationLines.join("\n")))
    }
    // Code block
    else if (line.startsWith("```")) {
      const language = line.slice(3).trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i])
        i++
      }
      blocks.push(createCodeBlock(codeLines.join("\n"), language))
    }
    // Quote
    else if (line.startsWith("> ")) {
      blocks.push(createQuote(line.slice(2)))
    }
    // Divider
    else if (line.match(/^---+$/)) {
      blocks.push(createDivider())
    }
    // Paragraph
    else {
      blocks.push(createParagraph(line))
    }

    i++
  }

  return blocks
}

function parseRichText(text: string) {
  const richText: any[] = []
  let currentText = ""
  let i = 0

  while (i < text.length) {
    // Bold **text**
    if (text[i] === "*" && text[i + 1] === "*") {
      if (currentText) {
        richText.push({ type: "text", text: { content: currentText } })
        currentText = ""
      }
      i += 2
      let boldText = ""
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "*")) {
        boldText += text[i]
        i++
      }
      richText.push({
        type: "text",
        text: { content: boldText },
        annotations: { bold: true },
      })
      i += 2
    }
    // Italic *text*
    else if (text[i] === "*") {
      if (currentText) {
        richText.push({ type: "text", text: { content: currentText } })
        currentText = ""
      }
      i++
      let italicText = ""
      while (i < text.length && text[i] !== "*") {
        italicText += text[i]
        i++
      }
      richText.push({
        type: "text",
        text: { content: italicText },
        annotations: { italic: true },
      })
      i++
    }
    // Inline equation $text$ (but not $$)
    else if (text[i] === "$" && text[i + 1] !== "$") {
      if (currentText) {
        richText.push({ type: "text", text: { content: currentText } })
        currentText = ""
      }
      i++
      let equationText = ""
      while (i < text.length && text[i] !== "$") {
        equationText += text[i]
        i++
      }
      richText.push({
        type: "equation",
        equation: { expression: equationText },
      })
      i++ // Skip closing $
    }
    // Code `text`
    else if (text[i] === "`") {
      if (currentText) {
        richText.push({ type: "text", text: { content: currentText } })
        currentText = ""
      }
      i++
      let codeText = ""
      while (i < text.length && text[i] !== "`") {
        codeText += text[i]
        i++
      }
      richText.push({
        type: "text",
        text: { content: codeText },
        annotations: { code: true },
      })
      i++
    } else {
      currentText += text[i]
      i++
    }
  }

  if (currentText) {
    richText.push({ type: "text", text: { content: currentText } })
  }

  return richText.length > 0 ? richText : [{ type: "text", text: { content: text } }]
}

function createHeading(text: string, level: 1 | 2 | 3): NotionBlock {
  const type = `heading_${level}`
  return {
    object: "block",
    type,
    [type]: {
      rich_text: parseRichText(text),
    },
  }
}

function createParagraph(text: string): NotionBlock {
  return {
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: parseRichText(text),
    },
  }
}

function createBulletedListItem(text: string): NotionBlock {
  return {
    object: "block",
    type: "bulleted_list_item",
    bulleted_list_item: {
      rich_text: parseRichText(text),
    },
  }
}

function createNumberedListItem(text: string): NotionBlock {
  return {
    object: "block",
    type: "numbered_list_item",
    numbered_list_item: {
      rich_text: parseRichText(text),
    },
  }
}

function createCodeBlock(code: string, language: string): NotionBlock {
  return {
    object: "block",
    type: "code",
    code: {
      rich_text: [{ type: "text", text: { content: code } }],
      language: language || "plain text",
    },
  }
}

function createQuote(text: string): NotionBlock {
  return {
    object: "block",
    type: "quote",
    quote: {
      rich_text: parseRichText(text),
    },
  }
}

function createDivider(): NotionBlock {
  return {
    object: "block",
    type: "divider",
    divider: {},
  }
}

function createEquationBlock(expression: string): NotionBlock {
  return {
    object: "block",
    type: "equation",
    equation: {
      expression: expression.trim(),
    },
  }
}
