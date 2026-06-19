'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, Plus, Pencil, Trash2 } from 'lucide-react'

interface Category {
  id: string
  name: string
  event: string
  nominees: number
  status: 'active' | 'closed'
}

const mockCategories: Category[] = [
  { id: '1', name: 'Best Developer', event: 'Tech Awards 2026', nominees: 8, status: 'active' },
  { id: '2', name: 'Best Designer', event: 'Tech Awards 2026', nominees: 5, status: 'active' },
  { id: '3', name: 'Best Startup', event: 'Business Awards 2026', nominees: 10, status: 'active' },
  { id: '4', name: 'Best CEO', event: 'Business Awards 2026', nominees: 4, status: 'closed' },
  { id: '5', name: 'Best Artist', event: 'Creative Awards 2026', nominees: 12, status: 'active' },
]

export default function AdminCategoriesPage() {
  const [search, setSearch] = useState('')

  const filtered = mockCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.event.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Category Management</h1>
          <p className="text-muted-foreground mt-1">Moderate and manage all event categories</p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{mockCategories.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {mockCategories.filter((c) => c.status === 'active').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {mockCategories.filter((c) => c.status === 'closed').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Closed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">
              {mockCategories.reduce((sum, c) => sum + c.nominees, 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Total Nominees</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories or events..."
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto w-full -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Event</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Nominees</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((category) => (
                  <tr key={category.id} className="border-b border-border/50 hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-medium text-foreground">{category.name}</td>
                    <td className="py-3 px-4 text-muted-foreground">{category.event}</td>
                    <td className="py-3 px-4 text-muted-foreground">{category.nominees}</td>
                    <td className="py-3 px-4">
                      <Badge variant={category.status === 'active' ? 'default' : 'secondary'}>
                        {category.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      No categories found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}