import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building, Users, BookOpen, ChevronRight } from 'lucide-react';

interface CurrentSelectionProps {
  institute?: {
    id: string;
    name: string;
  };
  class?: {
    id: string;
    name: string;
  };
  subject?: {
    id: string;
    name: string;
  };
}

const CurrentSelection: React.FC<CurrentSelectionProps> = ({
  institute,
  class: selectedClass,
  subject
}) => {
  if (!institute && !selectedClass && !subject) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          <Building className="h-4 w-4" />
          Current Selection
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {institute && (
            <>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200">
                <Building className="h-3 w-3 mr-1" />
                {institute.name}
              </Badge>
              {selectedClass && <ChevronRight className="h-4 w-4 text-blue-600" />}
            </>
          )}
          
          {selectedClass && (
            <>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200">
                <Users className="h-3 w-3 mr-1" />
                {selectedClass.name}
              </Badge>
              {subject && <ChevronRight className="h-4 w-4 text-indigo-600" />}
            </>
          )}
          
          {subject && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200">
              <BookOpen className="h-3 w-3 mr-1" />
              {subject.name}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CurrentSelection;