'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card-v2'
import { Button } from '@/components/ui/button-v2'
import { Badge } from '@/components/ui/badge'
import {
  Mail,
  Send,
  CheckCircle,
  XCircle,
  TrendingUp,
  Clock,
  AlertCircle,
  Eye,
  MousePointer,
  BarChart3,
  Search,
  Filter,
  Download,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface EmailLog {
  id: string
  resend_id: string
  email_type: string
  recipient_email: string
  recipient_name: string
  subject: string
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed'
  sent_at: string
  opened_at?: string
  clicked_at?: string
  error_message?: string
}

interface EmailStats {
  total: number
  sent: number
  delivered: number
  opened: number
  clicked: number
  bounced: number
  failed: number
  delivery_rate: number
  open_rate: number
  click_rate: number
}

export function EmailManagement() {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [stats, setStats] = useState<EmailStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // TODO: Create actual API endpoints
      // For now, showing mock data structure
      const mockStats: EmailStats = {
        total: 1247,
        sent: 1247,
        delivered: 1198,
        opened: 847,
        clicked: 234,
        bounced: 12,
        failed: 37,
        delivery_rate: 96.1,
        open_rate: 70.7,
        click_rate: 27.6,
      }

      const mockLogs: EmailLog[] = [
        {
          id: '1',
          resend_id: 're_abc123',
          email_type: 'welcome',
          recipient_email: 'user@example.com',
          recipient_name: 'John Doe',
          subject: 'Welcome to QuiverCore',
          status: 'opened',
          sent_at: new Date(Date.now() - 3600000).toISOString(),
          opened_at: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: '2',
          resend_id: 're_def456',
          email_type: 'trial_ending',
          recipient_email: 'trial@example.com',
          recipient_name: 'Jane Smith',
          subject: 'Your trial is ending soon',
          status: 'delivered',
          sent_at: new Date(Date.now() - 7200000).toISOString(),
        },
      ]

      setStats(mockStats)
      setLogs(mockLogs)
    } catch (error) {
      console.error('Failed to fetch email data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'opened':
        return <Eye className="h-4 w-4 text-blue-600" />
      case 'clicked':
        return <MousePointer className="h-4 w-4 text-purple-600" />
      case 'bounced':
        return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Send className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      delivered: 'default',
      opened: 'default',
      clicked: 'default',
      sent: 'secondary',
      bounced: 'destructive',
      failed: 'destructive',
    }

    return (
      <Badge variant={variants[status] || 'secondary'} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status}
      </Badge>
    )
  }

  const filteredLogs = logs.filter((log) => {
    const matchesType = filterType === 'all' || log.email_type === filterType
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus
    const matchesSearch =
      searchQuery === '' ||
      log.recipient_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesType && matchesStatus && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">Monitor and manage all emails sent from the platform</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time emails sent</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.delivery_rate}%</div>
              <p className="text-xs text-muted-foreground">{stats.delivered.toLocaleString()} delivered</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.open_rate}%</div>
              <p className="text-xs text-muted-foreground">{stats.opened.toLocaleString()} opened</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <MousePointer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.click_rate}%</div>
              <p className="text-xs text-muted-foreground">{stats.clicked.toLocaleString()} clicked</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Email Logs</CardTitle>
          <CardDescription>Recent emails sent from the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by email or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-md text-sm dark:border-slate-600 dark:bg-slate-800"
                />
              </div>
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="all">All Types</option>
              <option value="welcome">Welcome</option>
              <option value="trial_ending">Trial Ending</option>
              <option value="payment_failed_1">Payment Failed #1</option>
              <option value="payment_failed_2">Payment Failed #2</option>
              <option value="payment_failed_3">Payment Failed #3</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-md text-sm dark:border-slate-600 dark:bg-slate-800"
            >
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="opened">Opened</option>
              <option value="clicked">Clicked</option>
              <option value="bounced">Bounced</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Logs Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium">Recipient</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Subject</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Type</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                        No emails found matching your filters
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="px-4 py-3">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">{log.recipient_name || 'Unknown'}</span>
                            <span className="text-xs text-muted-foreground">{log.recipient_email}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm">{log.subject}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">
                            {log.email_type.replace('_', ' ')}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">{getStatusBadge(log.status)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(log.sent_at), { addSuffix: true })}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredLogs.length} of {logs.length} emails
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Chart Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Email Performance Over Time
          </CardTitle>
          <CardDescription>Daily email delivery and engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
            <div className="text-center text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Chart visualization will be added here</p>
              <p className="text-sm">Install Recharts or similar charting library</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
