'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, Trophy, Share2, Download } from 'lucide-react'

export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <Trophy className="w-16 h-16 text-secondary mx-auto mb-4" />
          <h1 className="text-5xl font-bold text-primary mb-2">Annual Awards 2024</h1>
          <p className="text-lg text-muted-foreground">Results Announced</p>
        </div>

        <div className="space-y-8">
          {[
            { category: 'Best Innovation', winner: 'Tech Leaders Inc.', votes: 450, color: 'from-secondary to-primary' },
            { category: 'Excellence in Service', winner: 'Customer Care Co.', votes: 380, color: 'from-secondary to-primary' },
            { category: 'Leadership Award', winner: 'Sarah Johnson', votes: 320, color: 'from-secondary to-primary' },
            { category: 'Rising Star', winner: 'Future Tech Startup', votes: 215, color: 'from-secondary to-primary' }
          ].map((award, idx) => (
            <Card key={award.category} className="overflow-hidden hover:shadow-xl transition">
              <CardContent className="p-0">
                <div className={`h-1 bg-gradient-to-r ${award.color}`}></div>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Badge className="mb-3 bg-secondary/10 text-secondary">{award.category}</Badge>
                      <h2 className="text-3xl font-bold text-foreground">{award.winner}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold text-secondary">{award.votes}</div>
                      <p className="text-sm text-muted-foreground">votes</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button asChild className="bg-secondary hover:bg-secondary/90 text-white gap-2 flex-1">
                      <Link href="#" className="flex items-center justify-center gap-2">
                        <Award className="w-5 h-5" />
                        View Certificate
                      </Link>
                    </Button>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/5 gap-2 flex-1">
                      <Share2 className="w-5 h-5" />
                      Share
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-12 bg-gradient-to-br from-secondary/5 to-primary/5">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">Download Results</h3>
            <p className="text-muted-foreground mb-6">Get a comprehensive report of all results and participant information</p>
            <Button asChild className="bg-secondary hover:bg-secondary/90 text-white gap-2">
              <Link href="#" className="flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Download Full Report
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="text-center mt-12">
          <Button asChild variant="outline" className="border-primary text-primary">
            <Link href="/organizer/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
