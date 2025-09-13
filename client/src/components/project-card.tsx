import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Calendar, DollarSign, MapPin } from "lucide-react";
import { Link } from "wouter";

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  budget?: string;
  location: string;
  deadline?: string;
  status: string;
}

interface ProjectCardProps {
  project: Project;
  onViewBids?: (projectId: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open': return 'bg-green-100 text-green-800';
    case 'awarded': return 'bg-blue-100 text-blue-800';
    case 'completed': return 'bg-gray-100 text-gray-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-yellow-100 text-yellow-800';
  }
};

export default function ProjectCard({ project, onViewBids }: ProjectCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg" data-testid={`project-title-${project.id}`}>
            {project.name}
          </CardTitle>
          <Badge className={getStatusColor(project.status)} data-testid={`project-status-${project.id}`}>
            {project.status}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground capitalize">
          {project.category}
        </p>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground mb-4 line-clamp-2">
          {project.description}
        </p>
        
        <div className="space-y-2 mb-4">
          {project.budget && (
            <div className="flex items-center text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 mr-2" />
              ${parseFloat(project.budget).toLocaleString()}
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            {project.location}
          </div>
          
          {project.deadline && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              {new Date(project.deadline).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            data-testid={`button-view-${project.id}`}
          >
            View Details
          </Button>
          {project.status === 'open' && onViewBids && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onViewBids(project.id)}
              data-testid={`button-bids-${project.id}`}
            >
              View Bids
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
