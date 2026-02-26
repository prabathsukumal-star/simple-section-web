import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import calendarApi from '@/api/calendar.api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import CalendarDashboard from './CalendarDashboard';
import OperatingSchedule from './OperatingSchedule';
import GenerateCalendarWizard from './GenerateCalendarWizard';
import CalendarDayManagement from './CalendarDayManagement';
import EventManagement from './EventManagement';
import BulkDayUpdate from './BulkDayUpdate';
import CacheManagement from './CacheManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Trash2, AlertTriangle, LayoutDashboard, Settings2, Wand2, 
  CalendarDays, PartyPopper, Layers, Database, ChevronRight 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & stats' },
  { id: 'config', label: 'Config', icon: Settings2, description: 'Operating schedule' },
  { id: 'generate', label: 'Generate', icon: Wand2, description: 'Create calendar' },
  { id: 'calendar', label: 'Calendar', icon: CalendarDays, description: 'Day management' },
  { id: 'events', label: 'Events', icon: PartyPopper, description: 'Event management' },
  { id: 'bulk', label: 'Bulk Update', icon: Layers, description: 'Mass changes' },
  { id: 'cache', label: 'Cache', icon: Database, description: 'Diagnostics' },
];

const CalendarManagementPage: React.FC = () => {
  const { currentInstituteId, selectedInstitute } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteYear, setDeleteYear] = useState(new Date().getFullYear().toString());
  const [deleting, setDeleting] = useState(false);

  const handleDeleteCalendar = async () => {
    if (!currentInstituteId) return;
    setDeleting(true);
    try {
      const res = await calendarApi.deleteCalendar(currentInstituteId, deleteYear);
      toast.success(res?.message || 'Calendar deleted');
      setShowDeleteConfirm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete calendar');
    } finally {
      setDeleting(false);
    }
  };

  if (!currentInstituteId) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-base font-semibold mb-1">No Institute Selected</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Choose an institute to access Calendar Management — dashboard, config, generation, events, bulk updates, and cache diagnostics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">Calendar Management</h1>
              <p className="text-xs text-muted-foreground">{selectedInstitute?.name || 'Institute'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Scrollable pill-style */}
      <ScrollArea className="w-full">
        <div className="flex gap-1.5 pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                    : "bg-card hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/50 hover:border-border"
                )}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Breadcrumb indicator */}
      {activeTabData && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3 w-3" />
          <span>Calendar</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground font-medium">{activeTabData.label}</span>
          <span className="text-muted-foreground/60 ml-1">— {activeTabData.description}</span>
        </div>
      )}

      {/* Tab Content */}
      <div className="animate-slide-up">
        {activeTab === 'dashboard' && <CalendarDashboard onNavigate={setActiveTab} />}

        {activeTab === 'config' && <OperatingSchedule />}

        {activeTab === 'generate' && (
          <div className="space-y-4">
            <GenerateCalendarWizard />
            <Card className="border-destructive/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-destructive flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="h-3.5 w-3.5" />
                  </div>
                  Delete Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">Delete an existing calendar to regenerate it with different settings.</p>
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Year:</Label>
                  <Input value={deleteYear} onChange={e => setDeleteYear(e.target.value)} className="w-24 text-xs h-9" />
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)} className="h-9">
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'calendar' && <CalendarDayManagement />}
        {activeTab === 'events' && <EventManagement />}
        {activeTab === 'bulk' && <BulkDayUpdate />}
        {activeTab === 'cache' && <CacheManagement />}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Delete Calendar for {deleteYear}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all calendar days and events for {deleteYear}. All attendance linkages will be orphaned. This action cannot be undone!
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCalendar} disabled={deleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleting ? 'Deleting...' : 'Delete Calendar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CalendarManagementPage;
