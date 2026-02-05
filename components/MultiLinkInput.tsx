"use client"

import { useState } from "react"
import { Plus, X, ExternalLink } from "lucide-react"

interface ResourceLink {
  url: string
  title: string
  description?: string
}

interface MultiLinkInputProps {
  links: ResourceLink[]
  onChange: (links: ResourceLink[]) => void
  maxLinks?: number
  label?: string
}

export function MultiLinkInput({ links, onChange, maxLinks = 5, label = "Resource Links" }: MultiLinkInputProps) {
  const [newLink, setNewLink] = useState({ url: "", title: "", description: "" })

  const handleAddLink = () => {
    if (newLink.url.trim() && newLink.title.trim() && links.length < maxLinks) {
      onChange([...links, { ...newLink, url: newLink.url.trim(), title: newLink.title.trim() }])
      setNewLink({ url: "", title: "", description: "" })
    }
  }

  const handleRemoveLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-sm font-semibold mb-2">
        {label} (Optional) - Max {maxLinks}
      </label>
      <p className="text-xs text-foreground/50 mb-3">
        Add documentation, articles, GitHub repos, or any helpful resources
      </p>

      {/* Add New Link Form */}
      {links.length < maxLinks && (
        <div className="space-y-3 mb-4 p-4 rounded-lg bg-muted/50 border border-border">
          <input
            type="text"
            placeholder="Resource URL"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
          />
          <input
            type="text"
            placeholder="Resource Title"
            value={newLink.title}
            onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={newLink.description}
            onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
            className="w-full px-4 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary transition-colors"
          />
          <button
            type="button"
            onClick={handleAddLink}
            disabled={!newLink.url.trim() || !newLink.title.trim()}
            className="w-full px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Link {links.length > 0 && `(${links.length}/${maxLinks})`}
          </button>
        </div>
      )}

      {/* Links List */}
      {links.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground/70">Added Links ({links.length}/{maxLinks})</p>
          {links.map((link, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{link.title}</p>
                <p className="text-xs text-foreground/60 truncate">{link.url}</p>
                {link.description && (
                  <p className="text-xs text-foreground/50 mt-1">{link.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemoveLink(index)}
                className="flex-shrink-0 p-1.5 hover:bg-destructive/10 rounded-lg transition-colors text-destructive cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {links.length === 0 && (
        <p className="text-sm text-foreground/50 text-center py-4 border border-dashed border-border rounded-lg">
          No links added yet. Add up to {maxLinks} resource links.
        </p>
      )}
    </div>
  )
}
