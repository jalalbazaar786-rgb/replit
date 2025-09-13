import { useState } from "react";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Star, MapPin, Building2, CheckCircle, MessageCircle } from "lucide-react";

// Mock supplier data - in real app this would come from API
const mockSuppliers = [
  {
    id: 1,
    name: "ABC Concrete Co.",
    category: "materials",
    rating: 4.8,
    projects: 250,
    location: "New York, NY",
    verified: true,
    specialties: ["Concrete", "Steel", "Foundation"],
    description: "Premium concrete supplier with 20+ years experience"
  },
  {
    id: 2,
    name: "Metro Builders Ltd.",
    category: "subcontractor",
    rating: 4.6,
    projects: 180,
    location: "Los Angeles, CA",
    verified: true,
    specialties: ["Commercial", "Residential", "Renovation"],
    description: "Full-service construction contractor"
  },
  {
    id: 3,
    name: "Construction Plus",
    category: "machinery",
    rating: 4.9,
    projects: 320,
    location: "Chicago, IL",
    verified: true,
    specialties: ["Heavy Equipment", "Cranes", "Excavation"],
    description: "Equipment rental and operation services"
  },
  {
    id: 4,
    name: "Elite Workforce",
    category: "labor",
    rating: 4.7,
    projects: 150,
    location: "Houston, TX",
    verified: true,
    specialties: ["Skilled Labor", "Project Management", "Safety"],
    description: "Experienced construction workforce solutions"
  },
  {
    id: 5,
    name: "Green Building Solutions",
    category: "materials",
    rating: 4.5,
    projects: 95,
    location: "Seattle, WA",
    verified: false,
    specialties: ["Sustainable Materials", "Solar", "Insulation"],
    description: "Eco-friendly building materials specialist"
  },
  {
    id: 6,
    name: "Precision Engineering",
    category: "subcontractor",
    rating: 4.9,
    projects: 200,
    location: "Boston, MA",
    verified: true,
    specialties: ["Structural", "MEP", "Design"],
    description: "Engineering and specialized construction services"
  }
];

export default function Suppliers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const filteredSuppliers = mockSuppliers.filter((supplier) => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.specialties.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || supplier.category === categoryFilter;
    const matchesVerified = !verifiedOnly || supplier.verified;
    return matchesSearch && matchesCategory && matchesVerified;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'materials': return 'bg-blue-100 text-blue-800';
      case 'labor': return 'bg-green-100 text-green-800';
      case 'machinery': return 'bg-purple-100 text-purple-800';
      case 'subcontractor': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground" data-testid="page-title">Suppliers</h1>
                <p className="text-muted-foreground">Find and connect with verified construction suppliers</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search suppliers, specialties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-category">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="materials">Materials</SelectItem>
                  <SelectItem value="labor">Labor</SelectItem>
                  <SelectItem value="machinery">Machinery</SelectItem>
                  <SelectItem value="subcontractor">Subcontractor</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={verifiedOnly ? "default" : "outline"}
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                data-testid="button-verified-only"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Verified Only
              </Button>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-4" data-testid="results-count">
              {filteredSuppliers.length} suppliers found
            </p>
          </div>

          {/* Suppliers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center" data-testid={`supplier-name-${supplier.id}`}>
                        {supplier.name}
                        {supplier.verified && (
                          <CheckCircle className="w-4 h-4 text-green-600 ml-2" />
                        )}
                      </CardTitle>
                      <div className="flex items-center mt-2">
                        <div className="flex items-center mr-3">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm font-medium ml-1" data-testid={`supplier-rating-${supplier.id}`}>
                            {supplier.rating}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {supplier.projects}+ projects
                        </span>
                      </div>
                    </div>
                    <Badge className={getCategoryColor(supplier.category)}>
                      {supplier.category}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {supplier.description}
                  </p>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {supplier.location}
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Specialties:</p>
                      <div className="flex flex-wrap gap-1">
                        {supplier.specialties.map((specialty, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" data-testid={`button-view-${supplier.id}`}>
                      <Building2 className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                    <Button size="sm" variant="outline" data-testid={`button-message-${supplier.id}`}>
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No suppliers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
