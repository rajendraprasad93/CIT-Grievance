import React from 'react';
import { Heart, MessageCircle, Bookmark, TrendingUp, Users, Sparkles, CheckCircle } from 'lucide-react';

/**
 * Design System Showcase Component
 * Reference implementation of all design patterns from DESIGN_SYSTEM.md
 * Use this as a guide when building new components
 */

function DesignSystemShowcase() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-12">
      
      {/* Color Palette */}
      <section>
        <h2 className="text-heading-2 font-heading mb-6">Color Palette</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-heading-3 font-heading mb-3">Primary Colors</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-primary"></div>
                <p className="text-body-small font-medium">Primary (Teal)</p>
                <p className="text-body-tiny text-muted-foreground">#10B981</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-opportunity"></div>
                <p className="text-body-small font-medium">Purple</p>
                <p className="text-body-tiny text-muted-foreground">#8B5CF6</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-issue"></div>
                <p className="text-body-small font-medium">Amber</p>
                <p className="text-body-tiny text-muted-foreground">#F59E0B</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-heading-3 font-heading mb-3">Category Colors</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-help"></div>
                <p className="text-body-small font-medium">Help (Blue)</p>
                <p className="text-body-tiny text-muted-foreground">#3B82F6</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-life"></div>
                <p className="text-body-small font-medium">Life (Green)</p>
                <p className="text-body-tiny text-muted-foreground">#10B981</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-opportunity"></div>
                <p className="text-body-small font-medium">Opportunity</p>
                <p className="text-body-tiny text-muted-foreground">#8B5CF6</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-xl bg-issue"></div>
                <p className="text-body-small font-medium">Issue</p>
                <p className="text-body-tiny text-muted-foreground">#F59E0B</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <h2 className="text-heading-2 font-heading mb-6">Typography</h2>
        <div className="space-y-4 bg-white rounded-2xl p-6">
          <div>
            <h1 className="text-heading-1 font-heading">Heading 1 - 32px Bold</h1>
            <p className="text-body-tiny text-muted-foreground">font-heading text-heading-1</p>
          </div>
          <div>
            <h2 className="text-heading-2 font-heading">Heading 2 - 24px Bold</h2>
            <p className="text-body-tiny text-muted-foreground">font-heading text-heading-2</p>
          </div>
          <div>
            <h3 className="text-heading-3 font-heading">Heading 3 - 20px SemiBold</h3>
            <p className="text-body-tiny text-muted-foreground">font-heading text-heading-3</p>
          </div>
          <div>
            <p className="text-body-regular">Body Regular - 16px Normal</p>
            <p className="text-body-tiny text-muted-foreground">text-body-regular</p>
          </div>
          <div>
            <p className="text-body-small">Body Small - 14px Normal</p>
            <p className="text-body-tiny text-muted-foreground">text-body-small</p>
          </div>
          <div>
            <p className="text-body-tiny text-muted-foreground">Body Tiny - 12px Normal (text-body-tiny)</p>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section>
        <h2 className="text-heading-2 font-heading mb-6">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-button">
            Primary Button
          </button>
          <button className="px-6 py-3 rounded-xl bg-secondary text-foreground font-medium hover:bg-secondary/80 transition-colors">
            Secondary Button
          </button>
          <button className="px-6 py-3 rounded-xl border-2 border-primary text-primary font-medium hover:bg-primary/5 transition-colors">
            Outline Button
          </button>
          <button className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors">
            <Heart size={20} className="text-primary" />
          </button>
        </div>
      </section>

      {/* Category Tags */}
      <section>
        <h2 className="text-heading-2 font-heading mb-6">Category Tags</h2>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 rounded-full bg-help/10 text-help text-body-tiny font-medium border border-help/20">
            Help
          </span>
          <span className="px-3 py-1 rounded-full bg-life/10 text-life text-body-tiny font-medium border border-life/20">
            Campus Life
          </span>
          <span className="px-3 py-1 rounded-full bg-opportunity/10 text-opportunity text-body-tiny font-medium border border-opportunity/20">
            Opportunity
          </span>
          <span className="px-3 py-1 rounded-full bg-issue/10 text-issue text-body-tiny font-medium border border-issue/20">
            Issue
          </span>
        </div>
      </section>

      {/* Avatars */}
      <section>
        <h2 className="text-heading-2 font-heading mb-6">Avatars</h2>
        <div className="flex flex-wrap gap-6 items-center">
          {/* Default avatar */}
          <div className="text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-help to-help/70 flex items-center justify-center text-white text-sm font-bold ring-2 ring-help/20">
              P
            </div>
            <p className="text-body-tiny text-muted-foreground">Default</p>
          </div>
          
          {/* With badge */}
          <div className="text-center space-y-2">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-opportunity to-opportunity/70 flex items-center justify-center text-white text-sm font-bold ring-2 ring-opportunity/20">
                R
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary border-2 border-white flex items-center justify-center">
                <CheckCircle size={12} className="text-white" />
              </div>
            </div>
            <p className="text-body-tiny text-muted-foreground">Verified</p>
          </div>
          
          {/* Large avatar */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-issue to-issue/70 flex items-center justify-center text-white text-xl font-bold ring-2 ring-issue/20">
              A
            </div>
            <p className="text-body-tiny text-muted-foreground">Large</p>
          </div>
        </div>
      </section>

      {/* Badges */}
      <section>
        <h2 className="text-heading-2 font-heading mb-6">Badges</h2>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-body-tiny font-medium">
            <CheckCircle size={12} />
            Verified
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-life/10 text-life text-body-tiny font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-life"></span>
            Active
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-opportunity/10 text-opportunity text-body-tiny font-medium">
            New
          </span>
        </div>
      </section>

      {/* Moment Card Example */}
      <section>
        <h2 className="text-heading-2 font-heading mb-6">Moment Card</h2>
        <div className="max-w-2xl">
          <div className="bg-white rounded-2xl border-2 border-help/20 p-5 shadow-card hover:shadow-card-hover transition-all animate-slide-in">
            {/* Avatar + Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-help to-help/70 flex items-center justify-center text-white font-bold">
                P
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">Priya Sharma</p>
                <p className="text-body-tiny text-muted-foreground">CSE 3rd • 2m ago</p>
              </div>
            </div>
            
            {/* Content */}
            <p className="text-body-regular mb-3">
              Anyone free for DBMS revision in E-Block? 📚
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 rounded-full bg-help/10 text-help text-body-tiny font-medium">
                Help
              </span>
              <span className="px-3 py-1 rounded-full bg-help/10 text-help text-body-tiny font-medium">
                CSE
              </span>
              <span className="px-3 py-1 rounded-full bg-help/10 text-help text-body-tiny font-medium">
                Study Group
              </span>
            </div>
            
            {/* Reactions */}
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-1 text-muted-foreground hover:text-opportunity transition-colors">
                <span>😍</span>
                <span className="text-body-small font-medium">12</span>
              </button>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-help transition-colors">
                <MessageCircle size={16} />
                <span className="text-body-small font-medium">3</span>
              </button>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors">
                <span>🙋‍♂️</span>
                <span className="text-body-small">I can help</span>
              </button>
              <button className="flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors ml-auto">
                <Bookmark size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Animations */}
      <section>
        <h2 className="text-heading-2 font-heading mb-6">Animations</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-primary/10 flex items-center justify-center animate-slide-in">
              <TrendingUp className="text-primary" />
            </div>
            <p className="text-body-tiny text-muted-foreground">Slide In</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-opportunity/10 flex items-center justify-center animate-pulse-subtle">
              <Sparkles className="text-opportunity" />
            </div>
            <p className="text-body-tiny text-muted-foreground">Pulse Subtle</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-help/10 flex items-center justify-center animate-fade-in">
              <Users className="text-help" />
            </div>
            <p className="text-body-tiny text-muted-foreground">Fade In</p>
          </div>
          <div className="bg-white rounded-xl p-4 text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-issue/10 flex items-center justify-center animate-bounce-subtle">
              <Heart className="text-issue" />
            </div>
            <p className="text-body-tiny text-muted-foreground">Bounce Subtle</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default DesignSystemShowcase;
