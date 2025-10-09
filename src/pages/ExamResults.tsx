import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Award, RefreshCw, AlertTriangle, TrendingUp, BookOpen, Calendar, Target, Download, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { examResultsApi, type ExamResult, type ExamResultsQueryParams } from '@/api/examResults.api';
import { useApiRequest } from '@/hooks/useApiRequest';

const ExamResults = () => {
  const { user, selectedInstitute, selectedClass, selectedSubject } = useAuth();
  const { toast } = useToast();
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);

  const { execute: fetchResults, loading } = useApiRequest(examResultsApi.getExamResults);

  const loadExamResults = async () => {
    if (!selectedInstitute?.id || !selectedClass?.id || !selectedSubject?.id) {
      toast({
        title: "Selection Required",
        description: "Please select institute, class, and subject to view exam results",
        variant: "destructive",
      });
      return;
    }

    try {
      const params: ExamResultsQueryParams = {
        page: currentPage,
        limit: 10,
        instituteId: selectedInstitute.id,
        classId: selectedClass.id,
        subjectId: selectedSubject.id
      };

      const response = await fetchResults(params);
      
      setExamResults(response.data);
      setTotalResults(response.meta.total);
      setTotalPages(response.meta.totalPages);
      setHasNextPage(response.meta.hasNextPage);
      setHasPreviousPage(response.meta.hasPreviousPage);
      
      toast({
        title: "Results Loaded",
        description: `Loaded ${response.data.length} exam results`,
      });
    } catch (error) {
      console.error('Error loading exam results:', error);
      toast({
        title: "Error",
        description: "Failed to load exam results",
        variant: "destructive",
      });
    }
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    loadExamResults();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getGradeColor = (grade: string) => {
    switch (grade.toUpperCase()) {
      case 'A+':
      case 'A':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'B+':
      case 'B':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'C+':
      case 'C':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'D':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'F':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const calculateAverageScore = () => {
    if (examResults.length === 0) return 0;
    const totalScore = examResults.reduce((sum, result) => sum + parseFloat(result.score), 0);
    return Math.round((totalScore / examResults.length) * 100) / 100;
  };

  const getGradeDistribution = () => {
    const distribution: Record<string, number> = {};
    examResults.forEach(result => {
      const grade = result.grade.toUpperCase();
      distribution[grade] = (distribution[grade] || 0) + 1;
    });
    return distribution;
  };

  const gradeDistribution = getGradeDistribution();
  const averageScore = calculateAverageScore();

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Exam Results</h1>
          <p className="text-muted-foreground">
            View and analyze exam results for the selected context
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadExamResults} 
            disabled={loading || !selectedInstitute || !selectedClass || !selectedSubject}
            variant="default"
            size="sm"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Load Results
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Current Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Current Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              Institute: {selectedInstitute?.name || 'Not Selected'}
            </Badge>
            <Badge variant="outline">
              Class: {selectedClass?.name || 'Not Selected'}
            </Badge>
            <Badge variant="outline">
              Subject: {selectedSubject?.name || 'Not Selected'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {!selectedInstitute || !selectedClass || !selectedSubject ? (
        <Card>
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Selection Required</h3>
            <p className="text-muted-foreground">
              Please select institute, class, and subject to view exam results.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          {examResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Results</CardTitle>
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {totalResults}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Target className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {averageScore}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">A Grades</CardTitle>
                  <Award className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {(gradeDistribution.A || 0) + (gradeDistribution['A+'] || 0)}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {averageScore >= 85 ? 'Excellent' : averageScore >= 70 ? 'Good' : averageScore >= 50 ? 'Average' : 'Poor'}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grade Distribution */}
          {examResults.length > 0 && Object.keys(gradeDistribution).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Grade Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {Object.entries(gradeDistribution).map(([grade, count]) => (
                    <div key={grade} className="flex items-center gap-2">
                      <Badge className={getGradeColor(grade)}>
                        Grade {grade}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {count} result{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Exam Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                {totalResults} total result{totalResults !== 1 ? 's' : ''}
              </p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading results...</span>
                </div>
              ) : examResults.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Exam Details</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Grade</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {examResults.map((result) => (
                          <TableRow key={result.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {result.student.firstName} {result.student.lastName}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {result.student.email}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{result.exam.title}</span>
                                <Badge variant="outline" className="text-xs w-fit mt-1">
                                  {result.exam.examType}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-lg font-semibold">{result.score}%</span>
                            </TableCell>
                            <TableCell>
                              <Badge className={getGradeColor(result.grade)}>
                                {result.grade}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1 text-sm">
                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                {formatDate(result.createdAt)}
                              </div>
                            </TableCell>
                            <TableCell className="max-w-[200px]">
                              <span className="text-sm text-muted-foreground truncate block" title={result.remarks}>
                                {result.remarks || 'No remarks'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={!hasPreviousPage}
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!hasNextPage}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Exam Results</h3>
                  <p className="text-muted-foreground">
                    No exam results found for the selected context.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ExamResults;