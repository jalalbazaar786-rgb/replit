import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import BidCard from "@/components/bid-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Calendar, Award } from "lucide-react";
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

  const handlePayAndAward = (bidId: string) => {
    // The payment modal in BidCard will handle the payment flow
    // and automatically award the bid upon successful payment
    console.log('Payment and award flow initiated for bid:', bidId);
  };

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
                <BidCard
                  key={bid.id}
                  bid={bid}
                  project={project}
                  supplierName={`Supplier #${index + 1}`}
                  canAward={canAwardBids && project.status === 'open'}
                  onAward={(bidId) => awardBidMutation.mutate(bidId)}
                  onPayAndAward={handlePayAndAward}
                  isAwarding={awardBidMutation.isPending}
                  index={index}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
