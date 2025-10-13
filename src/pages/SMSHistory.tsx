import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTableData } from '@/hooks/useTableData';
import MUITable from '@/components/ui/mui-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { RefreshCw, Filter, X } from 'lucide-react';
import { apiClient } from '@/api/client';

interface SMSMessage {
  id: string;
  instituteId: string;
  sentBy: string;
  messageType: string;
  recipientFilterType: string;
  messageTemplate: string;
  processedMessageSample: string;
  totalRecipients: number;
  successfulSends: number;
  failedSends: number;
  creditsUsed: number;
  status: string;
  maskIdUsed: string | null;
  senderName: string | null;
  filterCriteria: any;
  scheduledAt: string | null;
  approvedAt: string | null;
  approvedBy: string | null;
  sentAt: string | null;
  completedAt: string | null;
  rejectionReason: string | null;
  errorMessage: string | null;
  deliveryReport: any;
  notificationLogged: boolean;
  createdAt: string;
  updatedAt: string;
}


export default function SMSHistory() {
  const { selectedInstitute } = useAuth();
  const [selectedMessage, setSelectedMessage] = useState<SMSMessage | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [recipientFilter, setRecipientFilter] = useState<string>('');
  const [messageTypeFilter, setMessageTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const {
    state: { data: messages, loading },
    pagination: { page, limit, totalCount },
    actions: { setPage, setLimit, refresh, updateFilters }
  } = useTableData<SMSMessage>({
    endpoint: selectedInstitute ? `/enhanced-sms/message-history/${selectedInstitute.id}` : '',
    autoLoad: !!selectedInstitute,
    defaultParams: {
      recipientFilterType: recipientFilter || undefined,
      messageType: messageTypeFilter || undefined,
      search: searchQuery || undefined
    },
    pagination: {
      defaultLimit: 10,
      availableLimits: [10, 25, 50, 100]
    }
  });

  // Update filters in useTableData when they change
  useEffect(() => {
    updateFilters({
      recipientFilterType: recipientFilter || undefined,
      messageType: messageTypeFilter || undefined,
      search: searchQuery || undefined
    });
  }, [recipientFilter, messageTypeFilter, searchQuery, updateFilters]);

  const clearFilters = () => {
    setRecipientFilter('');
    setMessageTypeFilter('');
    setSearchQuery('');
  };

  const handleView = (message: SMSMessage) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      QUEUED: 'bg-yellow-500',
      PENDING: 'bg-blue-500',
      SENT: 'bg-green-500',
      FAILED: 'bg-red-500',
      APPROVED: 'bg-green-600',
      REJECTED: 'bg-red-600'
    };
    return (
      <Badge className={statusColors[status] || 'bg-gray-500'}>
        {status}
      </Badge>
    );
  };

  const columns = [
    {
      id: 'id',
      label: 'ID',
      minWidth: 80,
      format: (value: string) => `#${value}`
    },
    {
      id: 'sentBy',
      label: 'Sent By',
      minWidth: 100
    },
    {
      id: 'messageType',
      label: 'Message Type',
      minWidth: 150,
      format: (value: string) => value.replace(/_/g, ' ')
    },
    {
      id: 'recipientFilterType',
      label: 'Recipient Filter',
      minWidth: 150,
      format: (value: string) => value.replace(/_/g, ' ')
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: string) => getStatusBadge(value)
    },
    {
      id: 'scheduledAt',
      label: 'Scheduled At',
      minWidth: 180,
      format: (value: string) => (value ? format(new Date(value), 'PPpp') : '-')
    }
  ];

  if (!selectedInstitute) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Please select an institute to view SMS history</p>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">SMS Management</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">View all sent SMS messages</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
            size="sm"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
          </Button>
          <Button
            onClick={refresh}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{loading ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-muted/50 p-4 rounded-lg space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Filters</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search (ID / Sent By)</label>
              <Input
                placeholder="Search by ID or Sent By..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Filter</label>
              <Select value={recipientFilter || "all"} onValueChange={(value) => setRecipientFilter(value === "all" ? '' : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="CUSTOM">Custom</SelectItem>
                  <SelectItem value="STUDENTS">Students</SelectItem>
                  <SelectItem value="TEACHERS">Teachers</SelectItem>
                  <SelectItem value="PARENTS">Parents</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Message Type</label>
              <Select value={messageTypeFilter || "all"} onValueChange={(value) => setMessageTypeFilter(value === "all" ? '' : value)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All Message Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Message Types</SelectItem>
                  <SelectItem value="CUSTOM_NUMBERS">Custom Numbers</SelectItem>
                  <SelectItem value="BULK_INSTITUTE_USERS">Bulk Institute Users</SelectItem>
                  <SelectItem value="CLASS_BASED">Class Based</SelectItem>
                  <SelectItem value="SUBJECT_BASED">Subject Based</SelectItem>
                  <SelectItem value="USER_TYPE_BASED">User Type Based</SelectItem>
                  <SelectItem value="SPECIFIC_USERS">Specific Users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <MUITable
        title="SMS Messages"
        columns={columns}
        data={messages}
        page={page}
        rowsPerPage={limit}
        totalCount={totalCount}
        onPageChange={setPage}
        onRowsPerPageChange={setLimit}
        rowsPerPageOptions={[10, 25, 50, 100]}
        onView={handleView}
        allowAdd={false}
        allowEdit={false}
        allowDelete={false}
      />

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>SMS Message Details</DialogTitle>
          </DialogHeader>
          
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Message ID</label>
                  <p className="text-base">#{selectedMessage.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedMessage.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sent By</label>
                  <p className="text-base">{selectedMessage.sentBy}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Message Type</label>
                  <p className="text-base">{selectedMessage.messageType.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Recipient Filter</label>
                  <p className="text-base">{selectedMessage.recipientFilterType.replace(/_/g, ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Recipients</label>
                  <p className="text-base">{selectedMessage.totalRecipients}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Successful Sends</label>
                  <p className="text-base text-green-600">{selectedMessage.successfulSends}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Failed Sends</label>
                  <p className="text-base text-red-600">{selectedMessage.failedSends}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Credits Used</label>
                  <p className="text-base">{selectedMessage.creditsUsed}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sender Name</label>
                  <p className="text-base">{selectedMessage.senderName || 'N/A'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Message Template</label>
                <p className="text-base bg-gray-50 dark:bg-gray-800 p-3 rounded mt-1">
                  {selectedMessage.messageTemplate}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Processed Message Sample</label>
                <p className="text-base bg-gray-50 dark:bg-gray-800 p-3 rounded mt-1">
                  {selectedMessage.processedMessageSample}
                </p>
              </div>

              {selectedMessage.filterCriteria && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Filter Criteria</label>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {Object.entries(selectedMessage.filterCriteria).map(([key, val]) => (
                      <div key={key}>
                        <div className="text-xs text-gray-500">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                        </div>
                        <div className="text-base">
                          {Array.isArray(val) ? (val as any[]).join(', ') : String(val)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {selectedMessage.scheduledAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Scheduled At</label>
                    <p className="text-base">{format(new Date(selectedMessage.scheduledAt), 'PPpp')}</p>
                  </div>
                )}
                {selectedMessage.sentAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sent At</label>
                    <p className="text-base">{format(new Date(selectedMessage.sentAt), 'PPpp')}</p>
                  </div>
                )}
                {selectedMessage.approvedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Approved At</label>
                    <p className="text-base">{format(new Date(selectedMessage.approvedAt), 'PPpp')}</p>
                  </div>
                )}
                {selectedMessage.completedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Completed At</label>
                    <p className="text-base">{format(new Date(selectedMessage.completedAt), 'PPpp')}</p>
                  </div>
                )}
              </div>

              {selectedMessage.rejectionReason && (
                <div>
                  <label className="text-sm font-medium text-red-500">Rejection Reason</label>
                  <p className="text-base text-red-600">{selectedMessage.rejectionReason}</p>
                </div>
              )}

              {selectedMessage.errorMessage && (
                <div>
                  <label className="text-sm font-medium text-red-500">Error Message</label>
                  <p className="text-base text-red-600">{selectedMessage.errorMessage}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <label className="font-medium">Created At</label>
                  <p>{format(new Date(selectedMessage.createdAt), 'PPpp')}</p>
                </div>
                <div>
                  <label className="font-medium">Updated At</label>
                  <p>{format(new Date(selectedMessage.updatedAt), 'PPpp')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
