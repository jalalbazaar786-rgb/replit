import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, Clock, DollarSign, Calendar, Award } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

interface Bid {
  id: string;
  price: string;
  deliveryTime: number;
  proposal: string;
  status: string;
  supplierId: string;
  createdAt: string;
}

export default function BidComparison() {
  const [, params] = useRoute("/bid-comparison/:projectId");
  const projectId = params?.projectId;
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });

  const { data: bids = [], isLoading: bidsLoading } = useQuery<Bid[]>({
    queryKey: ['/api/projects', projectId, 'bids'],
    enabled: !!projectId,
  });

  const awardBidMutation = useMutation({
    mutationFn: async (bidId: string) => {
      const res = await apiRequest('POST', `/api/bids/${bidId}/award`, {});
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Bid Awarded",
        description: "The bid has been successfully awarded to the supplier.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'bids'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Award Bid",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const canAwardBids = user?.role === 'company' || user?.role === 'ngo';

  if (projectLoading || bidsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-96 bg-muted rounded-lg"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6 lg:p-8">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-foreground">Project not found</h2>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="page-title">
              Bid Comparison - {project.name}
            </h1>
            <p className="text-muted-foreground">
              Compare and evaluate bids for your project
            </p>
          </div>

          {/* Project Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium capitalize" data-testid="project-category">{project.category}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Budget</p>
                  <p className="font-medium" data-testid="project-budget">
                    {project.budget ? `$${parseFloat(project.budget).toLocaleString()}` : 'Not specified'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium" data-testid="project-location">{project.location}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className={project.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {project.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bids Grid */}
          {bids.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No bids yet</h3>
                <p className="text-muted-foreground">
                  Suppliers haven't submitted any bids for this project yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {bids.map((bid, index) => (
                <Card key={bid.id} className="relative">
                  {bid.status === 'accepted' && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                      <Award className="w-4 h-4" />
                    </div>
                  )}
                  
                  <CardHeader>
                    <div className="text-center">
                      <CardTitle className="text-lg" data-testid={`bid-supplier-${bid.id}`}>
                        Supplier #{index + 1}
                      </CardTitle>
                      <div className="mt-2">
                        <span className="text-2xl font-bold text-primary" data-testid={`bid-price-${bid.id}`}>
                          ${parseFloat(bid.price).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Timeline</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 mr-2" />
                          <span data-testid={`bid-delivery-${bid.id}`}>{bid.deliveryTime} days delivery</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-2">Proposal</h4>
                        <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`bid-proposal-${bid.id}`}>
                          {bid.proposal}
                        </p>
                      </div>

                      <div>
                        <h4 className="font-medium text-foreground mb-2">Submitted</h4>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{new Date(bid.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Sample company info - in real app this would come from supplier profile */}
                      <div>
                        <h4 className="font-medium text-foreground mb-2">Company Info</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Rating:</span>
                            <div className="flex items-center">
                              <span className="text-foreground">4.{7 + index}</span>
                              <Star className="w-4 h-4 text-yellow-400 ml-1 fill-current" />
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Projects:</span>
                            <span className="text-foreground">{150 + index * 50}+</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Insurance:</span>
                            <span className="text-green-600 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {canAwardBids && project.status === 'open' && bid.status === 'pending' && (
                      <Button
                        className="w-full mt-6"
                        onClick={() => awardBidMutation.mutate(bid.id)}
                        disabled={awardBidMutation.isPending}
                        data-testid={`button-award-${bid.id}`}
                      >
                        {awardBidMutation.isPending ? (
                          <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                        ) : null}
                        Award This Bid
                      </Button>
                    )}

                    {bid.status === 'accepted' && (
                      <div className="w-full mt-6 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex items-center text-green-800">
                          <Award className="w-4 h-4 mr-2" />
                          <span className="text-sm font-medium">Awarded Bid</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
