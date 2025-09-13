import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, CheckCircle, Clock, Calendar, Award } from "lucide-react";

interface Bid {
  id: string;
  price: string;
  deliveryTime: number;
  proposal: string;
  status: string;
  createdAt: string;
}

interface BidCardProps {
  bid: Bid;
  supplierName?: string;
  canAward?: boolean;
  onAward?: (bidId: string) => void;
  isAwarding?: boolean;
  index?: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default function BidCard({ 
  bid, 
  supplierName, 
  canAward = false, 
  onAward, 
  isAwarding = false,
  index = 0 
}: BidCardProps) {
  return (
    <Card className="relative">
      {bid.status === 'accepted' && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full">
          <Award className="w-4 h-4" />
        </div>
      )}
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg" data-testid={`bid-supplier-${bid.id}`}>
            {supplierName || `Supplier #${index + 1}`}
          </CardTitle>
          <Badge className={getStatusColor(bid.status)}>
            {bid.status}
          </Badge>
        </div>
        <div className="text-center mt-2">
          <span className="text-2xl font-bold text-primary" data-testid={`bid-price-${bid.id}`}>
            ${parseFloat(bid.price).toLocaleString()}
          </span>
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

          {/* Sample company info */}
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

        {canAward && bid.status === 'pending' && onAward && (
          <Button
            className="w-full mt-6"
            onClick={() => onAward(bid.id)}
            disabled={isAwarding}
            data-testid={`button-award-${bid.id}`}
          >
            {isAwarding ? (
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
  );
}
