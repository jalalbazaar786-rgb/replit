import { Bell, MessageCircle, Building2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user, logout } = useAuth();

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">BuildBidz</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-muted-foreground hover:text-foreground relative" data-testid="notifications-button">
              <Bell className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full"></span>
            </button>
            <button className="text-muted-foreground hover:text-foreground relative" data-testid="messages-button">
              <MessageCircle className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full"></span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground" data-testid="user-initials">
                  {getInitials(user?.username || 'U')}
                </span>
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-foreground" data-testid="user-name">{user?.username}</p>
                <p className="text-xs text-muted-foreground" data-testid="user-role">
                  {user?.role === 'company' ? 'Construction Company' : 
                   user?.role === 'supplier' ? 'Supplier' :
                   user?.role === 'ngo' ? 'NGO' : 'Admin'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={logout} data-testid="logout-button">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
