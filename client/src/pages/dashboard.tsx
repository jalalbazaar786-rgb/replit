import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, TrendingUp, DollarSign, Users, Plus, Search, BarChart3, MessageCircle, Upload } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/hooks/use-websocket";

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
        <main className="flex-1 p-6 lg:p-8">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-primary to-primary/80 construction-pattern rounded-xl p-8 text-primary-foreground">
              <div className="max-w-4xl">
                <h1 className="text-3xl lg:text-4xl font-bold mb-4" data-testid="hero-title">
                  Welcome back, {user?.username}!
                </h1>
                <p className="text-lg text-primary-foreground/90 mb-6">
                  Manage your construction projects, compare bids, and streamline your procurement process.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/post-requirement">
                    <Button 
                      className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                      data-testid="button-post-requirement"
                    >
                      Post New Requirement
                    </Button>
                  </Link>
                  <Link href="/projects">
                    <Button 
                      variant="outline" 
                      className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground border-primary-foreground/20"
                      data-testid="button-view-bids"
                    >
                      View Active Bids
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-active-projects">
                      {statsLoading ? "..." : stats?.activeProjects || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600 font-medium">+2.3%</span>
                  <span className="text-sm text-muted-foreground ml-1">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Bids</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-pending-bids">
                      {statsLoading ? "..." : stats?.pendingBids || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-secondary font-medium">+8 new</span>
                  <span className="text-sm text-muted-foreground ml-1">this week</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Spend</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-total-spend">
                      {statsLoading ? "..." : stats?.totalSpend || "$0"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-green-600 font-medium">-5.2%</span>
                  <span className="text-sm text-muted-foreground ml-1">cost savings</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Suppliers</p>
                    <p className="text-2xl font-bold text-foreground" data-testid="stat-suppliers">
                      {statsLoading ? "..." : stats?.suppliers || 0}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-sm text-purple-600 font-medium">12 verified</span>
                  <span className="text-sm text-muted-foreground ml-1">this month</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Projects and Quick Actions */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Recent Projects */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Projects</CardTitle>
                  <Link href="/projects">
                    <Button variant="ghost" size="sm" data-testid="button-view-all-projects">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.slice(0, 3).map((project: any) => (
                    <div key={project.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border/50">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground" data-testid={`project-name-${project.id}`}>
                            {project.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {project.category}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.status === 'open' ? 'bg-green-100 text-green-800' :
                            project.status === 'awarded' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          ${project.budget} Budget
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {projects.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No projects yet.</p>
                      <Link href="/post-requirement">
                        <Button className="mt-2" data-testid="button-create-first-project">
                          Create Your First Project
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Link href="/post-requirement">
                    <Button 
                      className="w-full h-auto p-4 bg-primary hover:bg-primary/90 text-primary-foreground flex flex-col items-start"
                      data-testid="quick-action-post-requirement"
                    >
                      <Plus className="w-8 h-8 mb-2" />
                      <h3 className="font-semibold">Post Requirement</h3>
                      <p className="text-sm opacity-90">Create new project listing</p>
                    </Button>
                  </Link>

                  <Link href="/suppliers">
                    <Button 
                      className="w-full h-auto p-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground flex flex-col items-start"
                      data-testid="quick-action-find-suppliers"
                    >
                      <Search className="w-8 h-8 mb-2" />
                      <h3 className="font-semibold">Find Suppliers</h3>
                      <p className="text-sm opacity-90">Browse verified vendors</p>
                    </Button>
                  </Link>

                  <Button 
                    variant="outline" 
                    className="w-full h-auto p-4 flex flex-col items-start"
                    data-testid="quick-action-view-analytics"
                  >
                    <BarChart3 className="w-8 h-8 mb-2" />
                    <h3 className="font-semibold">View Reports</h3>
                    <p className="text-sm">Procurement analytics</p>
                  </Button>

                  <Link href="/messages">
                    <Button 
                      variant="outline" 
                      className="w-full h-auto p-4 flex flex-col items-start"
                      data-testid="quick-action-messages"
                    >
                      <MessageCircle className="w-8 h-8 mb-2" />
                      <h3 className="font-semibold">Messages</h3>
                      <p className="text-sm">Communication center</p>
                    </Button>
                  </Link>
                </div>

                {/* Recent Documents Section */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-medium text-foreground mb-3">Recent Documents</h3>
                  <div className="space-y-2">
                    {documents.slice(0, 3).map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between text-sm">
                        <span className="text-foreground" data-testid={`document-${doc.id}`}>
                          {doc.name}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                    
                    {documents.length === 0 && (
                      <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-3"
                    data-testid="button-upload-document"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>

                {/* WebSocket Status */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Real-time Status:</span>
                    <span className={`flex items-center ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-600' : 'bg-red-600'}`} />
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
