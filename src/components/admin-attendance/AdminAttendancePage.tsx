import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import AdminAttendanceOverview from './AdminAttendanceOverview';
import AttendanceByUserType from './AttendanceByUserType';
import ClassSubjectDrillDown from './ClassSubjectDrillDown';
import AdminDashboardCharts from './AdminDashboardCharts';
import EnhancedAnalyticsCharts from './EnhancedAnalyticsCharts';
import CalendarAttendanceOverlay from './CalendarAttendanceOverlay';
import EventAttendanceView from './EventAttendanceView';
import CalendarDayAttendanceView from './CalendarDayAttendanceView';
import StudentAttendanceLookup from './StudentAttendanceLookup';
import CardManagement from './CardManagement';
import ExportReporting from './ExportReporting';
import AttendanceAlerts from './AttendanceAlerts';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  BarChart3, TrendingUp, Sparkles, CalendarDays, PartyPopper,
  Eye, Users, GitBranch, GraduationCap, CreditCard, Download,
  Bell, ChevronRight, AlertTriangle, Activity
} from 'lucide-react';

const tabGroups = [
  {
    label: 'Analytics',
    tabs: [
      { id: 'overview', label: 'Overview', icon: BarChart3, description: 'Summary dashboard' },
      { id: 'analytics', label: 'Analytics', icon: TrendingUp, description: 'Charts & trends' },
      { id: 'advanced', label: 'Advanced', icon: Sparkles, description: 'Deep analytics' },
    ],
  },
  {
    label: 'Calendar',
    tabs: [
      { id: 'calendar', label: 'Calendar', icon: CalendarDays, description: 'Calendar overlay' },
      { id: 'events', label: 'Events', icon: PartyPopper, description: 'Event attendance' },
      { id: 'day-view', label: 'Day View', icon: Eye, description: 'Daily breakdown' },
    ],
  },
  {
    label: 'Drilldowns',
    tabs: [
      { id: 'user-types', label: 'By Type', icon: Users, description: 'User type breakdown' },
      { id: 'drill-down', label: 'Drill-Down', icon: GitBranch, description: 'Class & subject' },
      { id: 'student', label: 'Student', icon: GraduationCap, description: 'Student lookup' },
    ],
  },
  {
    label: 'Tools',
    tabs: [
      { id: 'cards', label: 'Cards', icon: CreditCard, description: 'Card management' },
      { id: 'export', label: 'Export', icon: Download, description: 'Reports & export' },
      { id: 'alerts', label: 'Alerts', icon: Bell, description: 'Alert configuration' },
    ],
  },
];

const allTabs = tabGroups.flatMap(g => g.tabs);

const AdminAttendancePage: React.FC = () => {
  const { currentInstituteId, selectedInstitute } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const activeTabData = allTabs.find(t => t.id === activeTab);
  const activeGroup = tabGroups.find(g => g.tabs.some(t => t.id === activeTab));

  if (!currentInstituteId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-base font-semibold mb-1">No Institute Selected</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Select an institute to load admin attendance dashboards.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Attendance Monitoring</h1>
              <p className="text-xs text-muted-foreground">{selectedInstitute?.name || 'Institute'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grouped Tab Navigation */}
      <div className="space-y-2">
        {/* Group selector - horizontal pills */}
        <ScrollArea className="w-full">
          <div className="flex gap-1.5 pb-1">
            {tabGroups.map((group) => {
              const isGroupActive = group.tabs.some(t => t.id === activeTab);
              return (
                <button
                  key={group.label}
                  onClick={() => setActiveTab(group.tabs[0].id)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border",
                    isGroupActive
                      ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                      : "bg-card hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/50 hover:border-border"
                  )}
                >
                  <span>{group.label}</span>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Sub-tabs for active group */}
        {activeGroup && (
          <ScrollArea className="w-full">
            <div className="flex gap-1 pb-1">
              {activeGroup.tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-200",
                      isActive
                        ? "bg-secondary text-secondary-foreground shadow-sm"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        )}
      </div>

      {/* Breadcrumb */}
      {activeTabData && activeGroup && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Activity className="h-3 w-3" />
          <span>Attendance</span>
          <ChevronRight className="h-3 w-3" />
          <span>{activeGroup.label}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{activeTabData.label}</span>
          <span className="text-muted-foreground/60 ml-1">— {activeTabData.description}</span>
        </div>
      )}

      {/* Tab Content */}
      <div className="animate-slide-up" key={activeTab}>
        {activeTab === 'overview' && <AdminAttendanceOverview />}
        {activeTab === 'analytics' && <AdminDashboardCharts />}
        {activeTab === 'advanced' && <EnhancedAnalyticsCharts />}
        {activeTab === 'calendar' && <CalendarAttendanceOverlay />}
        {activeTab === 'events' && <EventAttendanceView />}
        {activeTab === 'day-view' && <CalendarDayAttendanceView />}
        {activeTab === 'user-types' && <AttendanceByUserType />}
        {activeTab === 'drill-down' && <ClassSubjectDrillDown />}
        {activeTab === 'student' && <StudentAttendanceLookup />}
        {activeTab === 'cards' && <CardManagement />}
        {activeTab === 'export' && <ExportReporting />}
        {activeTab === 'alerts' && <AttendanceAlerts />}
      </div>
    </div>
  );
};

export default AdminAttendancePage;
