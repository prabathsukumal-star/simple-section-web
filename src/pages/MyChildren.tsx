import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { parentsApi, ParentChildrenResponse, ChildData } from '@/api/parents.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Phone, Users, RefreshCw, ChevronRight, Heart, Mail, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import PageContainer from '@/components/layout/PageContainer';
import AppLayout from '@/components/layout/AppLayout';

const MyChildren = () => {
  const [childrenData, setChildrenData] = useState<ParentChildrenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, setSelectedChild } = useAuth();

  // Auto-load children on mount
  useEffect(() => {
    if (user?.id && !childrenData) {
      handleLoadChildren();
    }
  }, [user?.id]);

  const handleLoadChildren = async () => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User not logged in',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const data = await parentsApi.getChildren(user.id);
      setChildrenData(data);
    } catch (error) {
      console.error('Error loading children:', error);
      toast({
        title: 'Error',
        description: 'Failed to load children data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChild = (child: ChildData) => {
    setSelectedChild({
      id: child.id,
      name: child.name,
      user: {
        firstName: child.name.split(' ')[0] || child.name,
        lastName: child.name.split(' ').slice(1).join(' ') || '',
        phoneNumber: child.phoneNumber
      }
    } as any);
    navigate(`/child/${child.id}/attendance`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRelationshipColor = (relationship: string) => {
    switch (relationship.toLowerCase()) {
      case 'father':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'mother':
        return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
      case 'guardian':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getRelationshipIcon = (relationship: string) => {
    return relationship.charAt(0).toUpperCase() + relationship.slice(1);
  };

  return (
    <AppLayout currentPage="my-children">
      <PageContainer>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight">My Children</h1>
              <p className="text-muted-foreground text-sm">
                View and manage your children's information
              </p>
            </div>
            <Button 
              onClick={handleLoadChildren} 
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {/* Parent Info */}
          {childrenData && (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                  {getInitials(childrenData.parentName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{childrenData.parentName}</span>
              <Badge variant="secondary" className="text-xs">Parent</Badge>
            </div>
          )}

          {/* Loading State */}
          {loading && !childrenData && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-muted" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && childrenData?.children.length === 0 && (
            <Card className="border-dashed border-2">
              <CardContent className="pt-12 pb-12">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                    <Users className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">No Children Found</h3>
                    <p className="text-muted-foreground max-w-sm mx-auto">
                      No children are linked to your account yet
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Children Grid */}
          {childrenData && childrenData.children.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {childrenData.children.map((child, index) => (
                <Card 
                  key={`${child.id}-${child.relationship}-${index}`} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleSelectChild(child)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-14 w-14">
                        {child.imageUrl ? (
                          <AvatarImage src={child.imageUrl} alt={child.name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {getInitials(child.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{child.name}</h3>
                        <p className="text-sm text-muted-foreground">{child.phoneNumber || 'No phone'}</p>
                        <Badge variant="outline" className={`mt-1 text-xs ${getRelationshipColor(child.relationship)}`}>
                          {getRelationshipIcon(child.relationship)}
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </PageContainer>
    </AppLayout>
  );
};

export default MyChildren;