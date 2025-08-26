import { useState } from "react"
import { CheckCircle, Circle, Bug } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const qaChecks = [
  {
    id: "search-pii",
    title: "Search for 'PII' shows ZG0001 on top",
    description: "Test search functionality with keyword 'PII'",
    category: "Search"
  },
  {
    id: "filter-safety",
    title: "Category filter 'Safety / Moderation' shows ZG0003, ZG0004, ZG0019",
    description: "Test category filtering for Safety / Moderation",
    category: "Filtering"
  },
  {
    id: "cart-export",
    title: "Add ZG0001 & ZG0002 to cart, then Export JSON/YAML works",
    description: "Test cart functionality and export features",
    category: "Cart & Export"
  },
  {
    id: "placeholder-override",
    title: "Override Collection default output placeholder updates spec",
    description: "Test collection configuration overrides",
    category: "Collection"
  },
  {
    id: "deep-link",
    title: "Deep link via URL param (?feature=ZG0001) opens modal",
    description: "Test direct feature linking functionality",
    category: "Deep Link"
  }
]

export function QAPanel() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())

  const toggleCheck = (id: string) => {
    const newCheckedItems = new Set(checkedItems)
    if (newCheckedItems.has(id)) {
      newCheckedItems.delete(id)
    } else {
      newCheckedItems.add(id)
    }
    setCheckedItems(newCheckedItems)
  }

  const completedCount = checkedItems.size
  const totalCount = qaChecks.length

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg"
          title="QA Panel"
        >
          <Bug className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[600px] sm:max-w-[600px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            QA Acceptance Tests
          </SheetTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Progress:</span>
            <Badge variant={completedCount === totalCount ? "default" : "secondary"}>
              {completedCount}/{totalCount}
            </Badge>
          </div>
        </SheetHeader>

        <Separator className="my-4" />

        <div className="space-y-4">
          {qaChecks.map((check) => (
            <div
              key={check.id}
              className="flex items-start gap-3 p-4 rounded-lg border transition-colors hover:bg-muted/50"
            >
              <Button
                variant="ghost"
                size="sm"
                className="p-0 h-auto hover:bg-transparent"
                onClick={() => toggleCheck(check.id)}
              >
                {checkedItems.has(check.id) ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium leading-tight">{check.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    {check.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{check.description}</p>
              </div>
            </div>
          ))}
        </div>

        <Separator className="my-6" />

        <div className="space-y-3">
          <div className="text-sm">
            <h4 className="font-medium mb-2">Testing Instructions:</h4>
            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
              <li>Check each item manually in the application</li>
              <li>Click the checkboxes to track your progress</li>
              <li>Report any failed tests to the development team</li>
            </ul>
          </div>
          
          {completedCount === totalCount && (
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                🎉 All acceptance tests completed!
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}