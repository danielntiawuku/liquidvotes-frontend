'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { adminApi } from '@/lib/api'
import { Search, Loader2, AlertCircle, Shield } from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  details: string | null
  ipAddress: string | null
  createdAt: string
  user: {
    name: string
    email: string
    role: string
  } | null
}

const actionColor: Record<string, string> = {
  DELETE_USER: 'text-destructive',
  NOMINEE_APPROVED: 'text-green-600',
  NOMINEE_REJECTED: 'text-destructive',
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await adminApi.getAuditLogs()
        setLogs(response.data.logs)
      } catch {
        setError('Failed to load audit logs.')
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [])

  const filtered = logs.filter((log) => {
    const term = search.toLowerCase()
    return (
      log.action.toLowerCase().includes(term) ||
      (log.details ?? '').toLowerCase().includes(term) ||
      (log.user?.email ?? '').toLowerCase().includes(term) ||
      (log.user?.name ?? '').toLowerCase().includes(term)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">
          Track all admin actions and system changes
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Info banner */}
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardContent className="p-4 flex gap-3">
          <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-foreground text-sm">
              Audit logs are permanently stored
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              All admin activities are immutable and cannot be deleted. Showing last 100 entries.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{logs.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Total Entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">
              {logs.filter((l) => l.action.includes('APPROVED')).length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Approvals</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-destructive">
              {logs.filter((l) =>
                l.action.includes('DELETE') || l.action.includes('REJECTED')
              ).length}
            </div>
            <p className="text-sm text-muted-foreground mt-1">Deletions / Rejections</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by action, user, or details..."
          className="pl-9"
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log Entries</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Timestamp</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Admin</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Action</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Details</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border/50 hover:bg-muted/30 transition"
                  >
                    <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {log.user ? (
                        <div>
                          <p className="font-medium text-foreground">{log.user.name}</p>
                          <p className="text-xs text-muted-foreground">{log.user.email}</p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">System</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <code className={`text-xs font-mono font-bold ${actionColor[log.action] ?? 'text-foreground'}`}>
                        {log.action}
                      </code>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-[280px]">
                      {log.details ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {log.ipAddress ?? '—'}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted-foreground">
                      {logs.length === 0
                        ? 'No audit logs yet.'
                        : 'No logs match your search.'}
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