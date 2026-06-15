'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Minus, Plus, ShoppingCart } from 'lucide-react'

interface Nominee {
  id: string
  name: string
  category: string
  description: string
}

export default function NomineePage({ params }: { params: { code: string } }) {
  const router = useRouter()
  const [votes, setVotes] = useState<Record<string, number>>({})

  // Mock nominees - these would come from the backend
  const nominees: Nominee[] = [
    {
      id: '1',
      name: 'John Smith',
      category: 'Excellence',
      description: 'Outstanding performance and dedication',
    },
    {
      id: '2',
      name: 'Jane Doe',
      category: 'Innovation',
      description: 'Creative solutions and forward thinking',
    },
    {
      id: '3',
      name: 'Mike Johnson',
      category: 'Excellence',
      description: 'Consistent high performance',
    },
  ]

  const handleVoteChange = (id: string, amount: number) => {
    setVotes((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + amount),
    }))
  }

  const totalVotes = Object.values(votes).reduce((sum, v) => sum + v, 0)

  const handleCheckout = () => {
    if (totalVotes === 0) return
    router.push('/voter/checkout')
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nominees</h1>
          <p className="text-muted-foreground">Event: {params.code}</p>
        </div>
        <Button onClick={handleCheckout} disabled={totalVotes === 0} className="gap-2">
          <ShoppingCart className="w-4 h-4" />
          Checkout ({totalVotes})
        </Button>
      </div>

      <div className="grid gap-4">
        {nominees.map((nominee) => (
          <Card key={nominee.id} className="overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{nominee.name}</h3>
                    <Badge variant="secondary">{nominee.category}</Badge>
                  </div>
                  <p className="text-muted-foreground">{nominee.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVoteChange(nominee.id, -1)}
                    disabled={!votes[nominee.id]}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="w-12 text-center font-bold text-lg">
                    {votes[nominee.id] || 0}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVoteChange(nominee.id, 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
