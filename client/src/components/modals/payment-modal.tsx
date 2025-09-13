import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Shield, Clock, DollarSign, User, Building2, AlertCircle } from "lucide-react";
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

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  budget: string;
  location: string;
  ownerId: string;
}

interface PaymentModalProps {
  bid: Bid;
  project: Project;
  supplierName?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPaymentSuccess?: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PaymentModal({ 
  bid, 
  project, 
  supplierName, 
  open, 
  onOpenChange, 
  onPaymentSuccess 
}: PaymentModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const createOrderMutation = useMutation({
    mutationFn: async (paymentData: {
      bidId: string;
      projectId: string;
      amount: number;
      type: string;
    }) => {
      const res = await apiRequest('POST', '/api/payments/create-order', paymentData);
      return await res.json();
    }
  });

  const verifyPaymentMutation = useMutation({
    mutationFn: async (verificationData: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      const res = await apiRequest('POST', '/api/payments/verify', verificationData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Payment Successful!",
        description: "The payment has been completed and the bid has been awarded.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id, 'bids'] });
      queryClient.invalidateQueries({ queryKey: ['/api/payments'] });
      onPaymentSuccess?.();
      onOpenChange(false);
      setIsProcessing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Payment Verification Failed",
        description: error.message || "Please contact support if the payment was deducted.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  });

  const handlePayment = async () => {
    if (!window.Razorpay) {
      toast({
        title: "Payment System Unavailable",
        description: "Razorpay checkout is not loaded. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create payment order
      const orderData = await createOrderMutation.mutateAsync({
        bidId: bid.id,
        projectId: project.id,
        amount: parseFloat(bid.price),
        type: 'escrow'
      });

      // Configure Razorpay options
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "BuildBidz",
        description: `Payment for ${project.name}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          // Verify payment on backend
          await verifyPaymentMutation.mutateAsync({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: user?.username || '',
          email: user?.email || '',
        },
        notes: {
          project_id: project.id,
          bid_id: bid.id,
          supplier_id: bid.supplierId,
        },
        theme: {
          color: "#2563eb"
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast({
              title: "Payment Cancelled",
              description: "You have cancelled the payment process.",
            });
          }
        }
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      setIsProcessing(false);
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const bidAmount = parseFloat(bid.price);
  const platformFee = bidAmount * 0.02; // 2% platform fee
  const totalAmount = bidAmount + platformFee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base" data-testid="payment-project-name">
                {project.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                {project.category} • {project.location}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4" />
                <span>Supplier: {supplierName || `Supplier #${bid.supplierId.slice(-4)}`}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>Delivery: {bid.deliveryTime} days</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Payment Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Bid Amount</span>
                <span data-testid="payment-bid-amount">₹{bidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Platform Fee (2%)</span>
                <span data-testid="payment-platform-fee">₹{platformFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Amount</span>
                <span data-testid="payment-total-amount">₹{totalAmount.toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Escrow Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-medium text-blue-900">Escrow Protection</h4>
                  <p className="text-sm text-blue-700">
                    Your payment is held securely in escrow until project completion. 
                    The supplier will be paid only after successful delivery.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-green-600 mt-0.5" />
            <p className="text-sm text-green-700">
              This payment is processed securely through Razorpay with 256-bit SSL encryption.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
              className="flex-1"
              data-testid="button-cancel-payment"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              disabled={isProcessing || createOrderMutation.isPending}
              className="flex-1"
              data-testid="button-proceed-payment"
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Pay ₹{totalAmount.toLocaleString()}
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}