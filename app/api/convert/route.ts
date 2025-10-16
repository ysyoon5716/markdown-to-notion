import { type NextRequest, NextResponse } from "next/server"
import { markdownToBlocks } from "@/lib/markdown-to-blocks"

export async function POST(request: NextRequest) {
  try {
    const { markdown, apiKey, pageId, title } = await request.json()

    if (!markdown || !apiKey || !pageId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Convert markdown to Notion blocks
    const blocks = markdownToBlocks(markdown)

    // Create a new page as a child of the selected page
    const response = await fetch(`https://api.notion.com/v1/pages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: {
          page_id: pageId,
        },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: title,
                },
              },
            ],
          },
        },
        children: blocks,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || "Failed to create Notion page" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error converting markdown:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
