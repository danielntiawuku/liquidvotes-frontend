'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, Share2, Flag } from 'lucide-react'

export default function VoterHistoryPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-primary mb-12">Voting History</h1>

        <div className="space-y-6">
          {[
            { event: 'Annual Awards 2024', date: 'Jan 31, 2024', status: 'completed', votes: 3 },
            { event: 'Customer Choice Awards', date: 'Feb 28, 2024', status: 'pending', votes: 0 },
            { event: 'Team Excellence Awards', date: 'Dec 20, 2023', status: 'completed', votes: 2 },
            { event: 'Innovation Recognition Program', date: 'Nov 15, 2023', status: 'completed', votes: 4 }
          ].map((item) => (
            <Card key={item.event} className="hover:shadow-lg transition">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-6 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-foreground">{item.event}</h3>
                      <Badge className={`${
                        item.status === 'completed'
                          ? 'bg-accent text-white'
                          : 'bg-secondary text-white'
                      }`}>
                        {item.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{item.date}</p>
                    {item.status === 'completed' && (
                      <p className="text-sm font-semibold text-secondary">{item.votes} votes cast</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {item.status === 'completed' ? (
                      <>
                        <Button asChild size="sm" className="bg-secondary hover:bg-secondary/90 text-white gap-2">
                          <Link href="/results" className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            View Results
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline" className="border-primary text-primary gap-2">
                          <Share2 className="w-4 h-4" />
                          Share
                        </Button>
                      </>
                    ) : (
                      <Button asChild size="sm" className="bg-secondary hover:bg-secondary/90 text-white">
                        <Link href="/voter/assistant">Complete Voting</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
