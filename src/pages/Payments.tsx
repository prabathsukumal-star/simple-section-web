import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download,
  RefreshCw,
  Plus,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { getBaseUrl } from '@/contexts/utils/auth.api';
import MUITable from '@/components/ui/mui-table';
import { usePagination } from '@/hooks/usePagination';

interface PaymentRecord {
  id: string;
  userId: string;
  paymentAmount: string;
  paymentMethod: string;
  paymentReference: string;
  paymentSlipUrl: string | null;
  paymentSlipFilename: string | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  paymentDate: string;
  paymentMonth: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentApiResponse {
  payments: PaymentRecord[];
  total: number;
  page: number;
  limit: number;
}

const Payments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [allPayments, setAllPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'VERIFIED' | 'REJECTED'>('PENDING');
  const [apiResponse, setApiResponse] = useState<PaymentApiResponse | null>(null);
  
  // Single pagination instance since we're loading all data
  const pagination = usePagination({ 
    defaultLimit: 50, 
    availableLimits: [25, 50, 100] 
  });

  // Load all payment history from API with pagination
  const loadPaymentHistory = async (showToast = true) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "No user ID available",
        variant: "destructive",
      });
      return;
    }

    const apiParams = pagination.getApiParams();
    
    setIsLoading(true);
    try {
      const baseUrl = getBaseUrl();
      const params = new URLSearchParams({
        page: apiParams.page.toString(),
        limit: apiParams.limit.toString()
      });
      
      const response = await fetch(`${baseUrl}/payment/my-payments?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: PaymentApiResponse = await response.json();
      console.log('Payment API Response:', data);
      
      setApiResponse(data);
      setAllPayments(data.payments); // Store current page payments
      
      // Filter payments based on active tab
      filterPaymentsByStatus(data.payments, activeTab);
      
      // Update pagination with API response total
      pagination.actions.setTotalCount(data.total);
      
      if (showToast) {
        toast({
          title: "Data Loaded",
          description: `Successfully loaded ${data.payments.length} payment records.`
        });
      }
    } catch (error) {
      console.error('Error loading payment history:', error);
      if (showToast) {
        toast({
          title: "Error",
          description: "Failed to load payment history",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Filter payments by status on frontend
  const filterPaymentsByStatus = (currentPayments: PaymentRecord[], status: 'PENDING' | 'VERIFIED' | 'REJECTED') => {
    const filteredPayments = currentPayments.filter(payment => payment.status === status);
    setPayments(filteredPayments);
  };

  // Handle tab change - only filter existing data, no API call
  const handleTabChange = (tab: 'PENDING' | 'VERIFIED' | 'REJECTED') => {
    setActiveTab(tab);
    pagination.actions.reset(); // Reset pagination for new tab
    filterPaymentsByStatus(allPayments, tab); // Only filter existing data
  };

  // Handle pagination changes - no API calls
  const handlePageChange = (newPage: number) => {
    pagination.actions.setPage(newPage);
    // No API call - just update pagination state
  };

  const handleLimitChange = (newLimit: number) => {
    pagination.actions.setLimit(newLimit);
    // No API call - just update pagination state
  };

  const getStatusBadge = (status: PaymentRecord['status']) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: string) => {
    return `Rs ${parseFloat(amount).toLocaleString()}`;
  };

  const handleDownloadSlip = (payment: PaymentRecord) => {
    if (payment.paymentSlipUrl) {
      window.open(payment.paymentSlipUrl, '_blank');
      toast({
        title: "Opening Payment Slip",
        description: `Payment slip for ${payment.paymentReference} is being opened.`,
      });
    }
  };

  const handleNewPayment = () => {
    navigate('/payments/create');
  };

  // Define table columns
  const getColumns = () => [
    {
      id: 'paymentAmount',
      label: 'Amount',
      minWidth: 120,
      format: (value: string) => formatAmount(value)
    },
    {
      id: 'paymentReference',
      label: 'Reference',
      minWidth: 150,
      format: (value: string) => (
        <span className="font-mono text-xs">{value}</span>
      )
    },
    {
      id: 'paymentMethod',
      label: 'Method',
      minWidth: 120,
      format: (value: string) => value?.replace('_', ' ') || '-'
    },
    {
      id: 'paymentDate',
      label: 'Payment Date',
      minWidth: 150,
      format: (value: string) => formatDate(value)
    },
    {
      id: 'paymentMonth',
      label: 'Month',
      minWidth: 100
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value: PaymentRecord['status']) => getStatusBadge(value)
    },
    {
      id: 'notes',
      label: 'Notes',
      minWidth: 200,
      format: (value: string) => (
        <span className="text-sm text-gray-600 truncate block max-w-[200px]" title={value}>
          {value || '-'}
        </span>
      )
    },
    {
      id: 'rejectionReason',
      label: 'Rejection Reason',
      minWidth: 200,
      format: (value: string) => (
        <span className="text-sm text-red-600 truncate block max-w-[200px]" title={value}>
          {value || '-'}
        </span>
      )
    }
  ];

  // Custom actions for table rows
  const getCustomActions = () => [
    {
      label: 'View Slip',
      action: (row: PaymentRecord) => handleDownloadSlip(row),
      variant: 'outline' as const
    }
  ].filter(action => 
    action.label === 'View Slip' ? payments.some(p => p.paymentSlipUrl) : true
  );


  return (
    <AppLayout currentPage="system-payment">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CreditCard className="h-8 w-8" />
              Payment History
            </h1>
            <p className="text-muted-foreground">
              View your payment transactions and download invoices
            </p>
          </div>
        </div>

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatAmount(
                  allPayments.filter(p => p.status === 'VERIFIED').reduce((sum, p) => sum + parseFloat(p.paymentAmount), 0).toString()
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Verified Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {allPayments.filter(p => p.status === 'VERIFIED').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {allPayments.filter(p => p.status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {allPayments.filter(p => p.status === 'REJECTED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center">
          <Button
            onClick={handleNewPayment}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Payment
          </Button>
          
          <Button
            onClick={() => loadPaymentHistory()}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Payment Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => handleTabChange(value as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="PENDING" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Pending</span>
              <span className="sm:hidden">P</span>
              <span className="ml-1">({allPayments.filter(p => p.status === 'PENDING').length})</span>
            </TabsTrigger>
            <TabsTrigger value="VERIFIED" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Verified</span>
              <span className="sm:hidden">V</span>
              <span className="ml-1">({allPayments.filter(p => p.status === 'VERIFIED').length})</span>
            </TabsTrigger>
            <TabsTrigger value="REJECTED" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Rejected</span>
              <span className="sm:hidden">R</span>
              <span className="ml-1">({allPayments.filter(p => p.status === 'REJECTED').length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <MUITable
              title={`${activeTab} Payments`}
              columns={getColumns()}
              data={payments}
              customActions={getCustomActions()}
              page={pagination.pagination.page}
              rowsPerPage={pagination.pagination.limit}
              totalCount={payments.length}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleLimitChange}
              rowsPerPageOptions={pagination.availableLimits}
              allowAdd={false}
              allowEdit={false}
              allowDelete={false}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Payments;