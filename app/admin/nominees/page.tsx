'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react'

interface Nominee {
  id: string
  name: string
  code: string
  category: string
  event: string
  votes: number
  status: 'pending' | 'approved' | 'rejected'
}

const mockNominees: Nominee[] = [
  { id: '1', name: 'Sarah Mensah', code: 'WA01', category: 'Best Developer', event: 'Tech Awards 2026', votes: 320, status: 'approved' },
  { id: '2', name: 'Kwame Asante', code: 'WA02', category: 'Best Designer', event: 'Tech Awards 2026', votes: 210, status: 'approved' },
  { id: '3', name: 'Ama Owusu', code: 'WA03', category: 'Best Startup', event: 'Business Awards 2026', votes: 0, status: 'pending' },
  { id: '4', name: 'Kofi Boateng', code: 'WA04', category: 'Best CEO', event: 'Business Awards 2026', votes: 0, status: 'pending' },
  { id: '5', name: 'Abena Darko', code: 'WA05', category: 'Best Artist', event: 'Creative Awards 2026', votes: 145, status: 'approved' },
  { id: '6', name: 'Yaw Frimpong', code: 'WA06', category: 'Best Artist', event: 'Creative Awards 2026', votes: 0, status: 'rejected' },
]

const statusColor = {
  pending: 'secondary',
  approved: 'default',
  rejected: 'destructive',
} as const

export default function AdminNomineesPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  const filtered = mockNominees.filter((n) => {
    const matchesSearch =
      n.name.toLowerCase().includes(search.toLowerCase()) ||
      n.code.toLowerCase().includes(search.toLowerCase()) ||
      n.event.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || n.status === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nominee Management</h1>
          <p className="text-muted-foreground mt-1">Review, approve, and moderate nominees</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{mockNominees.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Nominees</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-500">
              {mockNominees.filter((n) => n.status === 'pending').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-500">
              {mockNominees.filter((n) => n.status === 'approved').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {mockNominees.filter((n) => n.status === 'rejected').length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nominees, codes, events..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(f)}
              className="capitalize"
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Nominees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Nominee</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Code</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Category</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Event</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Votes</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((nominee) => (
                  <tr key={nominee.id} className="border-b border-border/50 hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-medium text-foreground">{nominee.name}</td>
                    <td className="py-3 px-4">
                      <code className="bg-muted px-2 py-0.5 rounded text-xs">{nominee.code}</code>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{nominee.category}</td>
                    <td className="py-3 px-4 text-muted-foreground">{nominee.event}</td>
                    <td className="py-3 px-4 text-muted-foreground">{nominee.votes.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusColor[nominee.status]}>
                        {nominee.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {nominee.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-600">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                              <XCircle className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No nominees found.
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