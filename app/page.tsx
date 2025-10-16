import { MarkdownConverter } from "@/components/markdown-converter"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">Markdown to Notion</h1>
          <p className="text-muted-foreground text-lg">Convert your markdown text into Notion pages instantly</p>
        </div>
        <MarkdownConverter />
      </div>
    </main>
  )
}
