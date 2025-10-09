import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Eye, CheckCircle, Clock, XCircle, User, Calendar, FileText, DollarSign, Shield, RefreshCw, School, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { subjectPaymentsApi, SubjectPaymentSubmission } from '@/api/subjectPayments.api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import VerifySubjectPaymentDialog from '@/components/forms/VerifySubjectPaymentDialog';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
const PaymentSubmissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const {
    user
  } = useAuth();
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const paymentTitle = searchParams.get('paymentTitle');
  const [submissions, setSubmissions] = useState<SubjectPaymentSubmission[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [verifyingSubmission, setVerifyingSubmission] = useState<SubjectPaymentSubmission | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user can verify submissions (InstituteAdmin or Teacher only)
  const canVerifySubmissions = user?.userType === 'INSTITUTE_ADMIN' || user?.userType === 'TEACHER';
  const loadSubmissions = async (newPage?: number, newRowsPerPage?: number) => {
    if (loading || !paymentId) return;
    const currentPage = newPage !== undefined ? newPage + 1 : page + 1; // API uses 1-based indexing
    const currentLimit = newRowsPerPage || rowsPerPage;
    setLoading(true);
    try {
      const response = await subjectPaymentsApi.getPaymentSubmissions(paymentId, currentPage, currentLimit);
      setSubmissions(response.data);
      setTotalCount(response.total);
      setLoaded(true);
      toast({
        title: "Success",
        description: "Payment submissions loaded successfully."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load payment submissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const handleVerifySubmission = async (status: 'VERIFIED' | 'REJECTED', rejectionReason?: string, notes?: string) => {
    if (!verifyingSubmission) return;
    try {
      await subjectPaymentsApi.verifyPaymentSubmission(verifyingSubmission.id, {
        status,
        rejectionReason,
        notes
      });
      toast({
        title: "Success",
        description: `Payment submission ${status.toLowerCase()} successfully.`
      });

      // Reload submissions
      setLoaded(false);
      await loadSubmissions(page, rowsPerPage);
      setVerifyingSubmission(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to verify payment submission.",
        variant: "destructive"
      });
    }
  };
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
    loadSubmissions(newPage, rowsPerPage);
  };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = +event.target.value;
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    loadSubmissions(0, newRowsPerPage);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  // Filter submissions based on search term
  const filteredSubmissions = submissions.filter(submission => 
    submission.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    submission.submittedAmount?.toString().includes(searchTerm) ||
    submission.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    false
  );
  const handleRefresh = () => {
    setLoaded(false);
    setSearchTerm('');
    loadSubmissions(0, rowsPerPage);
  };
  const columns = [{
    id: 'username',
    label: 'Student Name',
    minWidth: 150
  }, {
    id: 'submittedAmount',
    label: 'Amount',
    minWidth: 100,
    align: 'right' as const
  }, {
    id: 'transactionId',
    label: 'Transaction ID',
    minWidth: 150
  }, {
    id: 'paymentDate',
    label: 'Payment Date',
    minWidth: 120
  }, {
    id: 'status',
    label: 'Status',
    minWidth: 100
  }, {
    id: 'uploadedAt',
    label: 'Submitted At',
    minWidth: 120
  }, {
    id: 'receipt',
    label: 'Receipt',
    minWidth: 100
  }, {
    id: 'actions',
    label: 'Actions',
    minWidth: 150
  }];
  return <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        {/* Current Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <School className="h-5 w-5" />
              <span>Current Selection</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">Institute:</span>
                <span className="font-semibold">Mahinda College</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">Class:</span>
                <span className="font-semibold">Grade 10 - Maths</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium text-gray-600 dark:text-gray-400">Subject:</span>
                <span className="font-semibold">Grade 10 Maths</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Submissions Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Payment Submissions</span>
              </CardTitle>
              <Button onClick={handleRefresh} disabled={loading} variant="outline" size="sm" className="flex items-center space-x-2">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>
            {paymentId && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Payment ID: {paymentId}
              </p>}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input placeholder="Search by student name, amount, or transaction ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
              </div>

              {/* Student Name and Institute Info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div>
                    <div className="space-y-1">
                      
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Payment Submissions</span>
                        <Badge variant="secondary">{totalCount} total</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Load Button or Table */}
              {!loaded ? <div className="text-center py-12">
                  <Button onClick={() => loadSubmissions()} disabled={loading} className="flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>{loading ? 'Loading...' : 'Load Submissions'}</span>
                  </Button>
                </div> : <Paper sx={{
              width: '100%',
              overflow: 'hidden',
              height: 'calc(100vh - 280px)'
            }}>
                  <TableContainer sx={{
                height: 'calc(100% - 52px)'
              }}>
                    <Table stickyHeader aria-label="payment submissions table">
                      <TableHead>
                        <TableRow>
                          {columns.map(column => <TableCell key={column.id} align={column.align} style={{
                        minWidth: column.minWidth
                      }}>
                              {column.label}
                            </TableCell>)}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredSubmissions.length === 0 ? <TableRow>
                            <TableCell colSpan={columns.length} align="center" sx={{
                        py: 8
                      }}>
                              <div className="text-center">
                                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg mb-2">
                                  {searchTerm ? 'No matching submissions found' : 'No submissions found'}
                                </p>
                                <p className="text-gray-400 dark:text-gray-500">
                                  {searchTerm ? 'Try adjusting your search criteria.' : 'Payment submissions will appear here when students submit payments.'}
                                </p>
                              </div>
                            </TableCell>
                          </TableRow> : filteredSubmissions.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(submission => <TableRow hover role="checkbox" tabIndex={-1} key={submission.id}>
                                <TableCell>{submission.username || 'Unknown User'}</TableCell>
                                <TableCell align="right">
                                  Rs {parseFloat(submission.submittedAmount || '0').toLocaleString()}
                                </TableCell>
                                <TableCell>{submission.transactionId}</TableCell>
                                <TableCell>
                                  {new Date(submission.paymentDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(submission.status)}`}>
                                    {submission.status}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  {new Date(submission.uploadedAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  {submission.receiptUrl ? (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => window.open(submission.receiptUrl, '_blank')} 
                                      className="flex items-center space-x-1"
                                    >
                                      <Eye className="h-3 w-3" />
                                      <span>View</span>
                                    </Button>
                                  ) : (
                                    <span className="text-gray-400 text-sm">No receipt</span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    {canVerifySubmissions && submission.status === 'PENDING' && (
                                      <Button 
                                        onClick={() => setVerifyingSubmission(submission)} 
                                        className="flex items-center space-x-1" 
                                        size="sm"
                                      >
                                        <Shield className="h-4 w-4" />
                                        <span>Verify</span>
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>)}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination rowsPerPageOptions={[25, 50, 100]} component="div" count={searchTerm ? filteredSubmissions.length : totalCount} rowsPerPage={rowsPerPage} page={page} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
                </Paper>}
            </div>
          </CardContent>
        </Card>
        
        {/* Verification Dialog */}
        <VerifySubjectPaymentDialog open={!!verifyingSubmission} onOpenChange={open => !open && setVerifyingSubmission(null)} submission={verifyingSubmission} onVerify={handleVerifySubmission} />
      </div>
    </AppLayout>;
};
export default PaymentSubmissionsPage;