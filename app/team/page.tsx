'use client'

import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Edit2, Trash2, Plus } from 'lucide-react'

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">Team Members</h1>
            <p className="text-muted-foreground">Manage team members and permissions</p>
          </div>
          <Button asChild className="bg-secondary hover:bg-secondary/90 text-white gap-2">
            <Link href="#" className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Invite Member
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          {[
            { name: 'Jane Smith', email: 'jane@awards.com', role: 'Admin', status: 'active' },
            { name: 'Mike Johnson', email: 'mike@awards.com', role: 'Editor', status: 'active' },
            { name: 'Sarah Davis', email: 'sarah@awards.com', role: 'Viewer', status: 'active' },
            { name: 'Tom Wilson', email: 'tom@awards.com', role: 'Editor', status: 'pending' }
          ].map((member) => (
            <Card key={member.email} className="hover:shadow-lg transition">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <div className="flex gap-2 mt-3">
                    <Badge className={`${
                      member.role === 'Admin' 
                        ? 'bg-primary text-white'
                        : member.role === 'Editor'
                        ? 'bg-secondary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {member.role}
                    </Badge>
                    <Badge className={`${
                      member.status === 'active'
                        ? 'bg-accent text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {member.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-primary text-primary">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-destructive text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
