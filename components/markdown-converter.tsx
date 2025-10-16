"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, FileText, Key, Search, CheckCircle2, AlertCircle, FilePlus } from "lucide-react"
import { PageSelector } from "@/components/page-selector"
import { cleanGeminiCitations } from "@/lib/clean-gemini-citations"
import { getNotionApiKey, setNotionApiKey } from "@/lib/storage"

export function MarkdownConverter() {
  const [markdown, setMarkdown] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [mode, setMode] = useState<"append" | "create">("create")
  const [pageTitle, setPageTitle] = useState("New page")
  const [selectedPage, setSelectedPage] = useState<{ id: string; title: string } | null>(null)
  const [targetPage, setTargetPage] = useState<{ id: string; title: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Load API key from localStorage on mount
  useEffect(() => {
    const cachedApiKey = getNotionApiKey()
    if (cachedApiKey) {
      setApiKey(cachedApiKey)
    }
  }, [])

  // Save API key to localStorage whenever it changes
  useEffect(() => {
    if (apiKey) {
      setNotionApiKey(apiKey)
    }
  }, [apiKey])

  const handleConvert = async () => {
    if (!markdown.trim()) {
      setStatus({ type: "error", message: "Please enter some markdown text" })
      return
    }
    if (!apiKey.trim()) {
      setStatus({ type: "error", message: "Please enter your Notion API key" })
      return
    }

    if (mode === "create") {
      if (!selectedPage) {
        setStatus({ type: "error", message: "Please select a parent page" })
        return
      }
      if (!pageTitle.trim()) {
        setStatus({ type: "error", message: "Please enter a page title" })
        return
      }
    } else {
      if (!targetPage) {
        setStatus({ type: "error", message: "Please select a target page to append to" })
        return
      }
    }

    setIsLoading(true)
    setStatus(null)

    try {
      // Auto-clean Gemini citations if [cite_start] is detected
      const processedMarkdown = markdown.includes("[cite_start]")
        ? cleanGeminiCitations(markdown)
        : markdown

      if (mode === "create") {
        const response = await fetch("/api/convert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            markdown: processedMarkdown,
            apiKey,
            pageId: selectedPage!.id,
            title: pageTitle,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create page")
        }

        setStatus({
          type: "success",
          message: `Successfully created "${pageTitle}" in "${selectedPage!.title}"!`,
        })
        setMarkdown("")
        setPageTitle("New page")
      } else {
        const response = await fetch("/api/append", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            markdown: processedMarkdown,
            apiKey,
            pageId: targetPage!.id,
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to append to page")
        }

        setStatus({
          type: "success",
          message: `Successfully appended markdown to "${targetPage!.title}"!`,
        })
        setMarkdown("")
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Markdown Input
          </CardTitle>
          <CardDescription>Enter your markdown text below</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="# Hello World&#10;&#10;This is **bold** and this is *italic*.&#10;&#10;- List item 1&#10;- List item 2"
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="h-[400px] resize-none font-mono text-sm"
          />
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Notion API Key
            </CardTitle>
            <CardDescription>Your API key is cached locally in your browser</CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              placeholder="secret_xxxxxxxxxxxxx"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Action Mode
            </CardTitle>
            <CardDescription>Choose how to add your markdown to Notion</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={mode} onValueChange={(value) => setMode(value as "append" | "create")} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <FilePlus className="h-4 w-4" />
                  Create New
                </TabsTrigger>
                <TabsTrigger value="append" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Append to Existing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Parent Page</label>
                  <PageSelector apiKey={apiKey} selectedPage={selectedPage} onSelectPage={setSelectedPage} />
                  <p className="text-xs text-muted-foreground">Select where to create the new page</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">New Page Title</label>
                  <Input
                    type="text"
                    placeholder="New page"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Enter a title for the new page</p>
                </div>
              </TabsContent>

              <TabsContent value="append" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Page</label>
                  <PageSelector apiKey={apiKey} selectedPage={targetPage} onSelectPage={setTargetPage} />
                  <p className="text-xs text-muted-foreground">Select which page to append the markdown to</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Button
          onClick={handleConvert}
          disabled={
            isLoading ||
            !markdown ||
            !apiKey ||
            (mode === "create" && (!selectedPage || !pageTitle.trim())) ||
            (mode === "append" && !targetPage)
          }
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === "create" ? "Creating Page..." : "Appending..."}
            </>
          ) : mode === "create" ? (
            "Create New Page in Notion"
          ) : (
            "Append to Notion Page"
          )}
        </Button>

        {status && (
          <Alert variant={status.type === "error" ? "destructive" : "default"}>
            {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertDescription>{status.message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
