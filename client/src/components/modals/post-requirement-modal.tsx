import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

interface PostRequirementModalProps {
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export default function PostRequirementModal({ trigger, onSuccess }: PostRequirementModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    budget: "",
    location: "",
    startDate: "",
    deadline: "",
    requirements: {
      safetyCertification: false,
      insuranceCoverage: false,
      previousExperience: false,
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async (projectData: any) => {
      const res = await apiRequest('POST', '/api/projects', projectData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Project Created",
        description: "Your project requirement has been posted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Create Project",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      budget: "",
      location: "",
      startDate: "",
      deadline: "",
      requirements: {
        safetyCertification: false,
        insuranceCoverage: false,
        previousExperience: false,
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData = {
      ...formData,
      budget: formData.budget ? parseFloat(formData.budget) : null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null,
    };

    createProjectMutation.mutate(projectData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRequirementChange = (requirement: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        [requirement]: checked
      }
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid="trigger-post-requirement">
            <Plus className="w-4 h-4 mr-2" />
            Post Requirement
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post New Requirement</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter project name"
                data-testid="input-project-name"
              />
            </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} required>
                <SelectTrigger data-testid="select-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="labor">Labor</SelectItem>
                  <SelectItem value="machinery">Machinery</SelectItem>
                  <SelectItem value="subcontractor">Subcontractor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Project Description</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your project requirements in detail..."
              rows={4}
              data-testid="textarea-description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="budget">Budget (USD)</Label>
              <Input
                id="budget"
                type="number"
                step="0.01"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget", e.target.value)}
                placeholder="50000"
                data-testid="input-budget"
              />
            </div>
            
            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleInputChange("deadline", e.target.value)}
                data-testid="input-deadline"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location">Project Location</Label>
            <Input
              id="location"
              type="text"
              required
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="Enter project location"
              data-testid="input-location"
            />
          </div>

          <div>
            <Label className="text-base font-medium">Required Certifications</Label>
            <div className="space-y-3 mt-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="safety"
                  checked={formData.requirements.safetyCertification}
                  onCheckedChange={(checked) => handleRequirementChange("safetyCertification", !!checked)}
                  data-testid="checkbox-safety"
                />
                <Label htmlFor="safety" className="text-sm font-normal">
                  Safety Certification Required
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="insurance"
                  checked={formData.requirements.insuranceCoverage}
                  onCheckedChange={(checked) => handleRequirementChange("insuranceCoverage", !!checked)}
                  data-testid="checkbox-insurance"
                />
                <Label htmlFor="insurance" className="text-sm font-normal">
                  Insurance Coverage Required
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="experience"
                  checked={formData.requirements.previousExperience}
                  onCheckedChange={(checked) => handleRequirementChange("previousExperience", !!checked)}
                  data-testid="checkbox-experience"
                />
                <Label htmlFor="experience" className="text-sm font-normal">
                  Previous Experience Required
                </Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createProjectMutation.isPending}
              data-testid="button-submit"
            >
              {createProjectMutation.isPending ? (
                <div className="animate-spin w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full mr-2" />
              ) : null}
              Post Requirement
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
