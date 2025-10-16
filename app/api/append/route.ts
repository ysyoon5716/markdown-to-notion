import { type NextRequest, NextResponse } from "next/server"
import { markdownToBlocks } from "@/lib/markdown-to-blocks"

export async function POST(request: NextRequest) {
  try {
    const { markdown, apiKey, pageId } = await request.json()

    if (!markdown || !apiKey || !pageId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Convert markdown to Notion blocks
    const blocks = markdownToBlocks(markdown)

    // Append blocks to the existing page
    const response = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        children: blocks,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || "Failed to append to Notion page" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error appending markdown:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
