import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import PaymentHistory from "@/components/payment-history";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, TrendingUp, DollarSign, Users, Plus, Search, BarChart3, 
  MessageCircle, Upload, CreditCard, Activity, Zap, Target, Globe,
  ArrowUpRight, ArrowDownRight, TrendingDown, CheckCircle2, Clock,
  AlertCircle, MoreHorizontal
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";
import { cn } from "@/lib/utils";

interface DashboardStats {
  activeProjects: number;
  pendingBids: number;
  totalSpend: string;
  suppliers: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { isConnected } = useWebSocket();

  const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['/api/documents'],
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8 space-y-8">
          {/* Premium Hero Section */}
          <div className="premium-gradient buildbidz-pattern rounded-2xl p-8 lg:p-12 text-primary-foreground animate-slide-up">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-3 h-3 rounded-full animate-pulse-soft",
                    isConnected ? "bg-green-400" : "bg-red-400"
                  )} />
                  <span className="text-sm font-medium opacity-90">
                    {isConnected ? 'Connected' : 'Reconnecting...'}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  Live Updates
                </Badge>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 tracking-tight" data-testid="hero-title">
                Welcome back,{' '}
                <span className="text-display bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {user?.username}!
                </span>
              </h1>
              
              <p className="text-xl text-primary-foreground/90 mb-8 leading-relaxed max-w-2xl">
                Manage your construction projects with enterprise-grade procurement tools. 
                Compare bids, track progress, and streamline your workflow.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/post-requirement">
                  <Button 
                    size="lg"
                    className="btn-premium bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg"
                    data-testid="button-post-requirement"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Post New Requirement
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button 
                    size="lg"
                    variant="outline" 
                    className="btn-premium bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                    data-testid="button-view-bids"
                  >
                    <BarChart3 className="w-5 h-5 mr-2" />
                    View Active Bids
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Premium Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="card-premium group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Active Projects</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="stat-active-projects">
                      {statsLoading ? "..." : stats?.activeProjects || 0}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-all">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-semibold">+2.3%</span>
                    <span className="text-sm text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <Progress value={73} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card className="card-premium group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Pending Bids</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="stat-pending-bids">
                      {statsLoading ? "..." : stats?.pendingBids || 0}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-secondary to-secondary-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-secondary/25 transition-all">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Activity className="w-4 h-4 text-secondary" />
                    <span className="text-sm text-secondary font-semibold">+8 new</span>
                    <span className="text-sm text-muted-foreground">this week</span>
                  </div>
                </div>
                <Progress value={85} className="mt-3 h-2 [&>div]:bg-secondary" />
              </CardContent>
            </Card>

            <Card className="card-premium group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Spend</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="stat-total-spend">
                      {statsLoading ? "..." : stats?.totalSpend || "$0"}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-green-500/25 transition-all">
                    <DollarSign className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <ArrowDownRight className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600 font-semibold">-5.2%</span>
                    <span className="text-sm text-muted-foreground">cost savings</span>
                  </div>
                </div>
                <Progress value={67} className="mt-3 h-2 [&>div]:bg-green-500" />
              </CardContent>
            </Card>

            <Card className="card-premium group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Suppliers</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="stat-suppliers">
                      {statsLoading ? "..." : stats?.suppliers || 0}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-purple-500/25 transition-all">
                    <Users className="w-7 h-7 text-white" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm text-purple-600 font-semibold">12 verified</span>
                    <span className="text-sm text-muted-foreground">this month</span>
                  </div>
                </div>
                <Progress value={92} className="mt-3 h-2 [&>div]:bg-purple-500" />
              </CardContent>
            </Card>
          </div>

          {/* Premium Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Recent Projects */}
            <Card className="card-premium">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-600 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-xl">Recent Projects</CardTitle>
                  </div>
                  <Link href="/projects">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="btn-premium text-primary hover:bg-primary/5"
                      data-testid="button-view-all-projects"
                    >
                      View All
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {projects.slice(0, 3).map((project: any, index: number) => (
                    <div 
                      key={project.id} 
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-muted/30 to-transparent rounded-xl border border-border/30 hover:border-primary/20 hover:shadow-sm transition-all duration-300 animate-slide-up"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/10 transition-all">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors" data-testid={`project-name-${project.id}`}>
                            {project.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {project.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={project.status === 'open' ? 'default' : project.status === 'awarded' ? 'secondary' : 'outline'}
                          className="mb-2"
                        >
                          {project.status === 'open' && <Clock className="w-3 h-3 mr-1" />}
                          {project.status === 'awarded' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                          {project.status !== 'open' && project.status !== 'awarded' && <AlertCircle className="w-3 h-3 mr-1" />}
                          {project.status}
                        </Badge>
                        <p className="text-sm font-medium text-foreground">
                          ${project.budget} Budget
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {projects.length === 0 && (
                    <div className="text-center py-12 premium-gradient-subtle rounded-xl">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Building2 className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground mb-4 text-lg">No projects yet</p>
                      <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                        Start your first construction project and begin receiving competitive bids.
                      </p>
                      <Link href="/post-requirement">
                        <Button className="btn-premium" data-testid="button-create-first-project">
                          <Plus className="w-4 h-4 mr-2" />
                          Create Your First Project
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Premium Quick Actions */}
            <Card className="card-premium">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary to-secondary-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  <CardTitle className="text-xl">Quick Actions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Link href="/post-requirement">
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary-600 p-6 text-white transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:scale-105 cursor-pointer">
                      <div className="relative z-10">
                        <Plus className="w-8 h-8 mb-3 transition-transform group-hover:scale-110" />
                        <h3 className="font-semibold mb-1">Post Requirement</h3>
                        <p className="text-sm opacity-90">Create new project listing</p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>

                  <Link href="/suppliers">
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-secondary to-secondary-600 p-6 text-white transition-all duration-300 hover:shadow-xl hover:shadow-secondary/25 hover:scale-105 cursor-pointer">
                      <div className="relative z-10">
                        <Search className="w-8 h-8 mb-3 transition-transform group-hover:scale-110" />
                        <h3 className="font-semibold mb-1">Find Suppliers</h3>
                        <p className="text-sm opacity-90">Browse verified vendors</p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Link>

                  <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-muted to-accent p-6 border border-border hover:border-primary/20 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                    <div className="relative z-10">
                      <BarChart3 className="w-8 h-8 mb-3 text-primary transition-transform group-hover:scale-110" />
                      <h3 className="font-semibold mb-1 text-foreground">View Reports</h3>
                      <p className="text-sm text-muted-foreground">Procurement analytics</p>
                    </div>
                  </div>

                  <Link href="/messages">
                    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-muted to-accent p-6 border border-border hover:border-secondary/20 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                      <div className="relative z-10 flex items-start justify-between">
                        <div>
                          <MessageCircle className="w-8 h-8 mb-3 text-secondary transition-transform group-hover:scale-110" />
                          <h3 className="font-semibold mb-1 text-foreground">Messages</h3>
                          <p className="text-sm text-muted-foreground">Communication center</p>
                        </div>
                        <Badge variant="secondary" className="animate-pulse-soft">7</Badge>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Premium Documents & Status */}
                <div className="space-y-6">
                  {/* Recent Documents */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Recent Documents
                      </h3>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="btn-premium"
                        data-testid="button-upload-document"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Upload
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      {documents.slice(0, 3).map((doc: any, index: number) => (
                        <div 
                          key={doc.id} 
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer animate-slide-up"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Upload className="w-4 h-4 text-primary" />
                            </div>
                            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors" data-testid={`document-${doc.id}`}>
                              {doc.name}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                      
                      {documents.length === 0 && (
                        <div className="text-center py-6 border-2 border-dashed border-border rounded-lg">
                          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="bg-gradient-to-r from-muted/30 to-transparent p-4 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-3 h-3 rounded-full animate-pulse-soft",
                          isConnected ? "bg-green-500" : "bg-red-500"
                        )} />
                        <span className="text-sm font-medium">
                          System Status: 
                          <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
                            {isConnected ? 'Online' : 'Reconnecting...'}
                          </span>
                        </span>
                      </div>
                      <Badge 
                        variant={isConnected ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {isConnected ? 'Live' : 'Offline'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History Section */}
          <div className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PaymentHistory limit={5} />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Payment Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Payments</span>
                      <span className="font-semibold" data-testid="total-payments">
                        {stats?.totalSpend || "$0"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Successful Rate</span>
                      <span className="font-semibold text-green-600" data-testid="success-rate">
                        98.5%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average Amount</span>
                      <span className="font-semibold" data-testid="average-amount">
                        $12.5K
                      </span>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <Button variant="outline" className="w-full" data-testid="button-view-payment-details">
                        View Payment Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
