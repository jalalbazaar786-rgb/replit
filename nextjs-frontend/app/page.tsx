import { Logo } from '@/components/brand/logo'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Premium Hero Section */}
      <div className="relative overflow-hidden">
        <div className="buildbidz-pattern absolute inset-0 opacity-30" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            {/* Premium Logo */}
            <div className="flex justify-center mb-8">
              <Logo size="xl" className="animate-slide-up" />
            </div>
            
            {/* Hero Content */}
            <div className="max-w-4xl mx-auto">
              <h1 className="text-display text-5xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
                Premium Construction
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Procurement Platform
                </span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-muted-foreground mb-12 leading-relaxed animate-slide-up" style={{animationDelay: '0.2s'}}>
                Connect construction companies, suppliers, and NGOs through our sophisticated 
                marketplace platform. Built for the modern construction industry.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{animationDelay: '0.3s'}}>
                <button className="btn-premium bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-lg">
                  Get Started
                </button>
                <button className="btn-premium border border-border bg-background hover:bg-muted px-8 py-4 text-lg">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Migration Status */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card-premium p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">🚀 Next.js Migration in Progress</h2>
          <p className="text-muted-foreground mb-6">
            We're migrating BuildBidz to Next.js + Python FastAPI + Supabase for enhanced performance and scalability.
          </p>
          
          {/* Migration Progress */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span>✅ Premium Design System</span>
              <span className="text-success">Complete</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span>🏗️ Next.js Frontend</span>
              <span className="text-warning">In Progress</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span>🐍 Python FastAPI Backend</span>
              <span className="text-muted-foreground">Pending</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span>📊 Supabase Integration</span>
              <span className="text-muted-foreground">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}