'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Download, Eye, Trash2 } from 'lucide-react'

export default function OrganizerDownloadsPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-primary mb-2">Downloads & Reports</h1>
          <p className="text-muted-foreground">Access your event data and reports</p>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Download Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Voting Results', desc: 'Final results and vote counts' },
              { name: 'Participant List', desc: 'All voters and their participation status' },
              { name: 'Financial Report', desc: 'Revenue and transaction details' },
              { name: 'Audit Log', desc: 'Complete system activity log' }
            ].map((type) => (
              <div key={type.name} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted transition">
                <div>
                  <p className="font-semibold text-foreground">{type.name}</p>
                  <p className="text-sm text-muted-foreground">{type.desc}</p>
                </div>
                <Button size="sm" className="bg-secondary hover:bg-secondary/90 text-white gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Downloads</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">File Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Size</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Annual-Awards-Results.csv', type: 'CSV', date: '2024-02-15', size: '2.4 MB' },
                  { name: 'Voter-Participation-Report.xlsx', type: 'Excel', date: '2024-02-14', size: '1.8 MB' },
                  { name: 'Financial-Summary-Jan.pdf', type: 'PDF', date: '2024-02-01', size: '0.9 MB' }
                ].map((file) => (
                  <tr key={file.name} className="border-b border-border hover:bg-muted">
                    <td className="px-6 py-4 font-semibold text-foreground">{file.name}</td>
                    <td className="px-6 py-4">
                      <Badge className="bg-secondary/10 text-secondary">{file.type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{file.date}</td>
                    <td className="px-6 py-4 text-muted-foreground">{file.size}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 hover:bg-background rounded transition">
                          <Download className="w-4 h-4 text-secondary" />
                        </button>
                        <button className="p-2 hover:bg-background rounded transition">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
