'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ThumbsUp, Share2, ArrowLeft } from 'lucide-react'

export default function NomineeDetailPage({ params }: { params: { nomineeId: string } }) {
  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <Button asChild variant="ghost" className="mb-8 gap-2 text-primary hover:bg-muted">
          <Link href="/organizer/nominees">
            <ArrowLeft className="w-5 h-5" />
            Back to Nominees
          </Link>
        </Button>

        <Card className="mb-12 overflow-hidden">
          <div className="h-40 bg-gradient-to-r from-secondary to-primary"></div>
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 -mt-20 relative z-10">
              <div className="flex-1">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center text-white font-bold text-4xl mb-6">
                  TL
                </div>
                <h1 className="text-4xl font-bold text-foreground mb-2">Tech Leaders Inc.</h1>
                <Badge className="bg-secondary/10 text-secondary mb-6">Best Innovation</Badge>
                <p className="text-lg text-muted-foreground mb-4">Leading innovator in enterprise technology solutions with a track record of excellence and forward-thinking practices.</p>
              </div>
              <div className="md:w-48">
                <div className="bg-muted rounded-lg p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Total Votes</p>
                  <p className="text-4xl font-bold text-secondary">450</p>
                  <p className="text-xs text-muted-foreground mt-4">Rank: 1st Place</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Nomination Date</p>
              <p className="text-lg font-semibold text-foreground mt-2">Jan 10, 2024</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Unique Voters</p>
              <p className="text-lg font-semibold text-foreground mt-2">387</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Avg Votes/Voter</p>
              <p className="text-lg font-semibold text-foreground mt-2">1.16</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>About the Nominee</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="font-semibold text-foreground mb-2">Company Description</p>
              <p className="text-muted-foreground">Tech Leaders Inc. specializes in developing cutting-edge enterprise solutions that help organizations transform their digital infrastructure. With over 15 years in the industry, we have consistently delivered value to Fortune 500 companies.</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-2">Key Achievements</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>300+ enterprise clients worldwide</li>
                <li>99.99% uptime guarantee</li>
                <li>Industry-leading innovation in AI/ML</li>
                <li>Multiple industry awards</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button asChild className="flex-1 bg-secondary hover:bg-secondary/90 text-white gap-2">
            <Link href="#" className="flex items-center justify-center gap-2">
              <ThumbsUp className="w-5 h-5" />
              Vote for This Nominee
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1 border-primary text-primary gap-2">
            <Link href="#" className="flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              Share
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
