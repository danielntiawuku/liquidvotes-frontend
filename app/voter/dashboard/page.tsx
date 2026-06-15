'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

export default function VoterDashboard() {
  const votingHistory = [
    {
      id: '1',
      eventName: 'Annual Awards 2024',
      votes: 3,
      amount: 15.00,
      date: '2024-06-01',
      status: 'completed',
    },
    {
      id: '2',
      eventName: 'Team Recognition',
      votes: 2,
      amount: 10.00,
      date: '2024-05-15',
      status: 'completed',
    },
  ]

  const chartData = [
    { month: 'Jan', votes: 0 },
    { month: 'Feb', votes: 0 },
    { month: 'Mar', votes: 0 },
    { month: 'Apr', votes: 0 },
    { month: 'May', votes: 2 },
    { month: 'Jun', votes: 3 },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Your Voting Dashboard</h1>
        <p className="text-muted-foreground">Track your voting history and participation</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Votes Cast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">$25.00</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Member Since</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold text-foreground">May 2024</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Voting Activity</CardTitle>
          <CardDescription>Your voting participation over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="votes" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Voting History</CardTitle>
          <CardDescription>Your recent voting submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {votingHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{item.eventName}</h4>
                  <p className="text-sm text-muted-foreground">{item.date}</p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <div>
                    <Badge variant="outline">{item.votes} votes</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">${item.amount.toFixed(2)}</div>
                    <Badge className="mt-1">{item.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
