import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Plus, 
  TrendingUp, 
  Users, 
  FileText, 
  MessageCircle, 
  BarChart3 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    group: "Overview"
  },
  {
    name: "My Projects", 
    href: "/projects",
    icon: ClipboardList,
    group: "Overview"
  },
  {
    name: "Post Requirement",
    href: "/post-requirement", 
    icon: Plus,
    group: "Procurement"
  },
  {
    name: "Active Bids",
    href: "/bids",
    icon: TrendingUp,
    group: "Procurement"
  },
  {
    name: "Suppliers",
    href: "/suppliers",
    icon: Users,
    group: "Procurement"
  },
  {
    name: "Documents",
    href: "/documents",
    icon: FileText,
    group: "Management"
  },
  {
    name: "Messages",
    href: "/messages",
    icon: MessageCircle,
    group: "Management"
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
    group: "Management"
  },
];

const groups = ["Overview", "Procurement", "Management"];

export default function Sidebar() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/dashboard" && (location === "/" || location === "/dashboard")) {
      return true;
    }
    return location === href;
  };

  return (
    <aside className="w-64 min-h-screen bg-card border-r border-border hidden lg:block">
      <div className="p-6">
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {group}
              </h3>
              <nav className="space-y-1">
                {navigation
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                          isActive(item.href)
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                        data-testid={`nav-${item.name.toLowerCase().replace(' ', '-')}`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
              </nav>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
