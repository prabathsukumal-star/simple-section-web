import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import adminAttendanceApi, { AdminAttendanceRecord } from '@/api/adminAttendance.api';
import { apiClient } from '@/api/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ReferenceLine,
} from 'recharts';
import { RefreshCw, TrendingUp, BarChart3, Target, Radar as RadarIcon } from 'lucide-react';
import { toast } from 'sonner';

const CHART_COLORS = {
  present: 'hsl(var(--chart-1))',
  absent: 'hsl(var(--chart-2))',
  late: 'hsl(var(--chart-3))',
  left: 'hsl(var(--chart-4))',
  leftEarly: 'hsl(var(--chart-5, 280 65% 60%))',
};

interface ClassOption { id: string; name: string }

const EnhancedAnalyticsCharts: React.FC = () => {
  const { currentInstituteId } = useAuth();
  const [records, setRecords] = useState<AdminAttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 3);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);

  const loadData = useCallback(async () => {
    if (!currentInstituteId) return;
    setLoading(true);
    try {
      const [recs, classRes] = await Promise.allSettled([
        adminAttendanceApi.getInstituteAttendanceRange(currentInstituteId, startDate, endDate, { ttl: 300 }),
        apiClient.get(`/institutes/${currentInstituteId}/classes`),
      ]);
      setRecords(recs.status === 'fulfilled' ? recs.value || [] : []);
      setClasses(classRes.status === 'fulfilled' ? (classRes.value?.data || classRes.value || []) : []);
    } catch (e: any) {
      toast.error(e.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, [currentInstituteId, startDate, endDate]);

  useEffect(() => { loadData(); }, [loadData]);

  // Chart 1: Daily stacked bar
  const dailyData = useMemo(() => {
    const grouped = new Map<string, { present: number; absent: number; late: number; left: number }>();
    for (const r of records) {
      const date = r.date || r.markedAt?.split('T')[0] || '';
      if (!grouped.has(date)) grouped.set(date, { present: 0, absent: 0, late: 0, left: 0 });
      const g = grouped.get(date)!;
      if (r.status === 'present') g.present++;
      else if (r.status === 'absent') g.absent++;
      else if (r.status === 'late') g.late++;
      else g.left++;
    }
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, g]) => ({
        date: new Date(date).toLocaleDateString('en-LK', { day: 'numeric', month: 'short' }),
        ...g,
      }));
  }, [records]);

  // Chart 2: Monthly trend line
  const monthlyTrend = useMemo(() => {
    const grouped = new Map<string, { present: number; total: number }>();
    for (const r of records) {
      const date = r.date || r.markedAt?.split('T')[0] || '';
      const monthKey = date.substring(0, 7);
      if (!grouped.has(monthKey)) grouped.set(monthKey, { present: 0, total: 0 });
      const g = grouped.get(monthKey)!;
      g.total++;
      if (r.status === 'present') g.present++;
    }
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, g]) => ({
        month: new Date(key + '-01').toLocaleString('en-US', { month: 'short' }),
        rate: g.total > 0 ? Math.round((g.present / g.total) * 1000) / 10 : 0,
      }));
  }, [records]);

  // Chart 3: Status donut
  const statusBreakdown = useMemo(() => {
    const counts = { present: 0, absent: 0, late: 0, left: 0, leftEarly: 0, leftLately: 0 };
    for (const r of records) {
      if (r.status === 'present') counts.present++;
      else if (r.status === 'absent') counts.absent++;
      else if (r.status === 'late') counts.late++;
      else if (r.status === 'left') counts.left++;
      else if (r.status === 'left_early') counts.leftEarly++;
      else if (r.status === 'left_lately') counts.leftLately++;
    }
    return [
      { name: 'Present', value: counts.present, color: CHART_COLORS.present },
      { name: 'Absent', value: counts.absent, color: CHART_COLORS.absent },
      { name: 'Late', value: counts.late, color: CHART_COLORS.late },
      { name: 'Left', value: counts.left + counts.leftEarly + counts.leftLately, color: CHART_COLORS.left },
    ].filter(d => d.value > 0);
  }, [records]);

  // Chart 4: Class-wise comparison (radar)
  const classRadarData = useMemo(() => {
    const classMap = new Map<string, { name: string; present: number; total: number }>();
    for (const r of records) {
      const key = r.classId || 'unknown';
      if (!classMap.has(key)) {
        const className = classes.find(c => c.id === key)?.name || r.className || key;
        classMap.set(key, { name: className, present: 0, total: 0 });
      }
      const g = classMap.get(key)!;
      g.total++;
      if (r.status === 'present') g.present++;
    }
    return Array.from(classMap.values())
      .filter(c => c.total > 5) // Only classes with enough data
      .slice(0, 8)
      .map(c => ({
        class: c.name.length > 12 ? c.name.substring(0, 12) + '…' : c.name,
        rate: c.total > 0 ? Math.round((c.present / c.total) * 1000) / 10 : 0,
      }));
  }, [records, classes]);

  // Chart 5: Class-wise breakdown table
  const classBreakdown = useMemo(() => {
    const classMap = new Map<string, { name: string; present: number; absent: number; late: number; total: number }>();
    for (const r of records) {
      const key = r.classId || 'unknown';
      if (!classMap.has(key)) {
        const className = classes.find(c => c.id === key)?.name || r.className || key;
        classMap.set(key, { name: className, present: 0, absent: 0, late: 0, total: 0 });
      }
      const g = classMap.get(key)!;
      g.total++;
      if (r.status === 'present') g.present++;
      else if (r.status === 'absent') g.absent++;
      else if (r.status === 'late') g.late++;
    }
    return Array.from(classMap.values())
      .filter(c => c.total > 0)
      .sort((a, b) => {
        const rA = a.present / a.total;
        const rB = b.present / b.total;
        return rB - rA;
      });
  }, [records, classes]);

  const overallRate = records.length > 0
    ? Math.round((records.filter(r => r.status === 'present').length / records.length) * 1000) / 10
    : 0;

  return (
    <div className="space-y-4">
      {/* Date Range */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Advanced Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <Label className="text-xs">From</Label>
              <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="text-xs" />
            </div>
            <div>
              <Label className="text-xs">To</Label>
              <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="text-xs" />
            </div>
            <Button size="sm" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Loading...' : 'Analyze'}
            </Button>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-primary">{overallRate}%</div>
              <div className="text-xs text-muted-foreground">{records.length} records</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      )}

      {!loading && records.length > 0 && (
        <>
          {/* Row 1: Daily Bar + Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Daily Stacked Bar */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Daily Attendance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="present" stackId="a" fill={CHART_COLORS.present} name="Present" />
                    <Bar dataKey="late" stackId="a" fill={CHART_COLORS.late} name="Late" />
                    <Bar dataKey="absent" stackId="a" fill={CHART_COLORS.absent} name="Absent" />
                    <Bar dataKey="left" stackId="a" fill={CHART_COLORS.left} name="Left" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status Donut */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusBreakdown.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Row 2: Monthly Trend + Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Monthly Trend */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Monthly Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v}%`} />
                    <ReferenceLine y={85} stroke="hsl(var(--chart-3))" strokeDasharray="5 5" label={{ value: 'Target: 85%', fontSize: 10 }} />
                    <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Radar - Class comparison */}
            {classRadarData.length >= 3 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Class Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={classRadarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="class" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                      <Radar dataKey="rate" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.25} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Row 3: Class-wise Table */}
          {classBreakdown.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Class-wise Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {classBreakdown.map((c, i) => {
                    const rate = c.total > 0 ? Math.round((c.present / c.total) * 1000) / 10 : 0;
                    return (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs font-medium w-28 truncate">{c.name}</span>
                        <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${rate}%` }} />
                        </div>
                        <Badge variant={rate >= 85 ? 'default' : rate >= 75 ? 'secondary' : 'destructive'} className="text-xs w-16 justify-center">
                          {rate}%
                        </Badge>
                        <span className="text-xs text-muted-foreground w-12 text-right">{c.present}/{c.total}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedAnalyticsCharts;
