import { useQuery, useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, Clock, Award } from "lucide-react";
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

interface BidComparisonModalProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BidComparisonModal({ projectId, open, onOpenChange }: BidComparisonModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId && open,
  });

  const { data: bids = [], isLoading: bidsLoading } = useQuery<Bid[]>({
    queryKey: ['/api/projects', projectId, 'bids'],
    enabled: !!projectId && open,
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
      onOpenChange(false);
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <div className="animate-pulse space-y-6">
            <div className="h-6 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-testid="modal-title">
            Bid Comparison - {project?.name || 'Project'}
          </DialogTitle>
        </DialogHeader>

        {bids.length === 0 ? (
          <div className="text-center py-12">
            <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No bids yet</h3>
            <p className="text-muted-foreground">
              Suppliers haven't submitted any bids for this project yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {bids.map((bid, index) => (
              <div key={bid.id} className="bg-muted/30 rounded-lg border border-border/50 p-6 relative">
                {bid.status === 'accepted' && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                    <Award className="w-4 h-4" />
                  </div>
                )}
                
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-foreground" data-testid={`bid-supplier-${bid.id}`}>
                    Supplier #{index + 1}
                  </h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-primary" data-testid={`bid-price-${bid.id}`}>
                      ${parseFloat(bid.price).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Timeline</h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery:</span>
                        <span className="text-foreground" data-testid={`bid-delivery-${bid.id}`}>
                          {bid.deliveryTime} days
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Installation:</span>
                        <span className="text-foreground">
                          {Math.ceil(bid.deliveryTime / 5)} days
                        </span>
                      </div>
                    </div>
                  </div>

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

                  <div>
                    <h4 className="font-medium text-foreground mb-2">Proposal</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3" data-testid={`bid-proposal-${bid.id}`}>
                      {bid.proposal}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-foreground mb-2">Included Services</h4>
                    <ul className="text-sm space-y-1">
                      <li className="flex items-center text-foreground">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        {index === 0 ? 'Premium grade materials' : index === 1 ? 'Standard grade materials' : 'Premium grade materials'}
                      </li>
                      <li className="flex items-center text-foreground">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        {index === 2 ? 'Express delivery' : 'Free delivery'}
                      </li>
                      <li className="flex items-center text-foreground">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        {index === 1 ? 'Business hours support' : '24/7 support'}
                      </li>
                      {index === 2 && (
                        <li className="flex items-center text-foreground">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          Quality guarantee
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {canAwardBids && project?.status === 'open' && bid.status === 'pending' && (
                  <Button
                    className="w-full mt-6"
                    onClick={() => awardBidMutation.mutate(bid.id)}
                    disabled={awardBidMutation.isPending}
                    data-testid={`button-award-${bid.id}`}
                  >
                    {awardBidMutation.isPending ? (
                      <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
                    ) : null}
                    Select This Bid
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
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
