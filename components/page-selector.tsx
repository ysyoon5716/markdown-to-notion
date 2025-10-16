"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Page {
  id: string
  title: string
}

interface PageSelectorProps {
  apiKey: string
  selectedPage: Page | null
  onSelectPage: (page: Page | null) => void
}

export function PageSelector({ apiKey, selectedPage, onSelectPage }: PageSelectorProps) {
  const [open, setOpen] = useState(false)
  const [pages, setPages] = useState<Page[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (apiKey && open && pages.length === 0) {
      fetchPages()
    }
  }, [apiKey, open])

  const fetchPages = async () => {
    if (!apiKey) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey }),
      })

      if (!response.ok) {
        throw new Error("Failed to fetch pages")
      }

      const data = await response.json()
      setPages(data.pages)
    } catch (error) {
      console.error("Error fetching pages:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
          disabled={!apiKey}
        >
          {selectedPage ? selectedPage.title : "Select a page..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search pages..." />
          <CommandList>
            {isLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <CommandEmpty>No pages found.</CommandEmpty>
                <CommandGroup>
                  {pages.map((page) => (
                    <CommandItem
                      key={page.id}
                      value={page.title}
                      onSelect={() => {
                        onSelectPage(page.id === selectedPage?.id ? null : page)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn("mr-2 h-4 w-4", selectedPage?.id === page.id ? "opacity-100" : "opacity-0")}
                      />
                      {page.title}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
