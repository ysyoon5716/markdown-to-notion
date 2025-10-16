import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    const response = await fetch("https://api.notion.com/v1/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // filter: {
        //   property: "object",
        //   value: "page",
        // },
        sort: {
          direction: "descending",
          timestamp: "last_edited_time",
        },
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json({ error: error.message || "Failed to fetch pages" }, { status: response.status })
    }

    const data = await response.json()
    const pages = data.results.map((page: any) => ({
      id: page.id,
      title:
        page.properties?.title?.title?.[0]?.plain_text || page.properties?.Name?.title?.[0]?.plain_text || "Untitled",
    }))

    return NextResponse.json({ pages })
  } catch (error) {
    console.error("Error fetching pages:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
