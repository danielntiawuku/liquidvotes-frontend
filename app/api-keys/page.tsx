'use client'

import { Navigation } from '@/components/shared/Navigation'
import Footer from '@/components/shared/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Copy, Eye, Trash2, Plus } from 'lucide-react'

export default function APIKeysPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-2">API Keys</h1>
            <p className="text-muted-foreground">Manage your API credentials for integration</p>
          </div>
          <Button asChild className="bg-secondary hover:bg-secondary/90 text-white gap-2">
            <button className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Key
            </button>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>How to Use</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Use your API keys to authenticate requests to our REST API. Keep them secure and never share them publicly.</p>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {[
            { name: 'Production Key', key: 'pk_live_abc123...xyz', created: 'Jan 10, 2024', status: 'active' },
            { name: 'Development Key', key: 'pk_dev_def456...uvw', created: 'Dec 15, 2023', status: 'active' },
            { name: 'Testing Key (Deprecated)', key: 'pk_test_ghi789...rst', created: 'Nov 20, 2023', status: 'inactive' }
          ].map((apiKey) => (
            <Card key={apiKey.key} className="hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-foreground">{apiKey.name}</h3>
                      <Badge className={`${
                        apiKey.status === 'active'
                          ? 'bg-accent text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {apiKey.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <code className="text-sm text-muted-foreground flex-1">{apiKey.key}</code>
                      <button className="p-1 hover:bg-background rounded transition">
                        <Copy className="w-4 h-4 text-secondary" />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Created: {apiKey.created}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-primary text-primary">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="border-destructive text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
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
