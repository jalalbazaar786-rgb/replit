import { Bell, MessageCircle, Search, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";

export default function Header() {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'company': return 'default';
      case 'supplier': return 'secondary';
      case 'ngo': return 'outline';
      case 'admin': return 'destructive';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'company': return 'Construction Company';
      case 'supplier': return 'Supplier';
      case 'ngo': return 'NGO';
      case 'admin': return 'Administrator';
      default: return 'User';
    }
  };

  return (
    <header className="bg-card/95 backdrop-blur-xl border-b border-border/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Premium Logo Section */}
          <div className="flex items-center space-x-8">
            <Logo size="md" className="animate-slide-up" />
            
            {/* Global Search (hidden on mobile) */}
            <div className="hidden lg:flex items-center relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search projects, suppliers..."
                  className="input-premium pl-10 pr-4 w-80 h-9 text-sm bg-muted/30 border-muted focus:bg-background"
                  data-testid="global-search"
                />
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button (mobile only) */}
            <Button variant="ghost" size="sm" className="lg:hidden" data-testid="mobile-search">
              <Search className="w-4 h-4" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative" data-testid="notifications-button">
              <Bell className="w-4 h-4" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center animate-pulse-soft"
              >
                3
              </Badge>
            </Button>

            {/* Messages */}
            <Button variant="ghost" size="sm" className="relative" data-testid="messages-button">
              <MessageCircle className="w-4 h-4" />
              <Badge 
                variant="secondary" 
                className="absolute -top-1 -right-1 w-5 h-5 text-xs p-0 flex items-center justify-center animate-pulse-soft"
              >
                7
              </Badge>
            </Button>

            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="flex items-center space-x-3 h-auto py-2 px-3 hover:bg-accent transition-all duration-200"
                  data-testid="user-menu-trigger"
                >
                  <Avatar className="w-8 h-8">
                    <AvatarFallback 
                      className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-medium text-sm"
                      data-testid="user-avatar"
                    >
                      {getInitials(user?.username || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="hidden sm:flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground leading-none" data-testid="user-name">
                      {user?.username}
                    </span>
                    <Badge 
                      variant={getRoleBadgeVariant(user?.role || '')}
                      className="mt-1 text-xs h-4"
                      data-testid="user-role-badge"
                    >
                      {getRoleLabel(user?.role || '')}
                    </Badge>
                  </div>
                  
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56 animate-slide-up">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user?.username}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="profile-menu-item">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="notifications-menu-item">
                  Notifications
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="billing-menu-item">
                  Billing & Plans
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="settings-menu-item">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => logout()}
                  className="text-destructive focus:text-destructive"
                  data-testid="logout-menu-item"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
