import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, Clock, CheckCircle, XCircle, ArrowUpRight, DollarSign } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface Payment {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  projectId: string;
  bidId: string;
  payerId: string;
  payeeId: string;
  amount: string;
  status: string;
  type: string;
  createdAt: string;
  updatedAt: string;
}

interface PaymentHistoryProps {
  projectId?: string;
  showHeader?: boolean;
  limit?: number;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid': return 'bg-green-100 text-green-800';
    case 'failed': return 'bg-red-100 text-red-800';
    case 'created': return 'bg-yellow-100 text-yellow-800';
    case 'refunded': return 'bg-gray-100 text-gray-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
    case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
    case 'created': return <Clock className="w-4 h-4 text-yellow-600" />;
    case 'refunded': return <ArrowUpRight className="w-4 h-4 text-gray-600" />;
    default: return <Clock className="w-4 h-4 text-gray-600" />;
  }
};

const getStatusDescription = (status: string) => {
  switch (status) {
    case 'paid': return 'Payment completed successfully';
    case 'failed': return 'Payment failed';
    case 'created': return 'Payment order created';
    case 'refunded': return 'Payment refunded';
    default: return 'Unknown status';
  }
};

export default function PaymentHistory({ projectId, showHeader = true, limit }: PaymentHistoryProps) {
  const { user } = useAuth();

  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: projectId ? ['/api/payments', { projectId }] : ['/api/payments'],
    enabled: !!user,
  });

  const displayedPayments = limit ? payments.slice(0, limit) : payments;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          {showHeader && <CardTitle>Payment History</CardTitle>}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          {showHeader && <CardTitle>Payment History</CardTitle>}
        </CardHeader>
        <CardContent className="text-center py-8">
          <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No payments yet</h3>
          <p className="text-muted-foreground">
            {projectId 
              ? "No payments have been made for this project yet."
              : "You haven't made any payments yet."
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        {showHeader && (
          <div className="flex items-center justify-between">
            <CardTitle>Payment History</CardTitle>
            <Badge variant="outline" data-testid="payment-count">
              {payments.length} payment{payments.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedPayments.map((payment) => (
            <div 
              key={payment.id} 
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              data-testid={`payment-${payment.id}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  {getStatusIcon(payment.status)}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground" data-testid={`payment-amount-${payment.id}`}>
                      ₹{parseFloat(payment.amount).toLocaleString()}
                    </span>
                    <Badge className={getStatusColor(payment.status)} data-testid={`payment-status-${payment.id}`}>
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getStatusDescription(payment.status)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Type: {payment.type}</span>
                    <span>•</span>
                    <span>Date: {new Date(payment.createdAt).toLocaleDateString()}</span>
                    {payment.razorpayPaymentId && (
                      <>
                        <span>•</span>
                        <span>ID: {payment.razorpayPaymentId.slice(-8)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {payment.status === 'paid' && (
                  <div className="text-xs text-green-600 font-medium">
                    ✓ Completed
                  </div>
                )}
                {payment.status === 'failed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // In a real app, this would retry the payment
                      console.log('Retry payment:', payment.id);
                    }}
                    data-testid={`button-retry-${payment.id}`}
                  >
                    Retry
                  </Button>
                )}
              </div>
            </div>
          ))}
          
          {limit && payments.length > limit && (
            <div className="text-center pt-4">
              <Button variant="outline" data-testid="button-view-all-payments">
                View All {payments.length} Payments
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}