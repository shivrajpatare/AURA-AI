export const AuraFooter = () => {
  return (
    <footer className="relative py-16 overflow-hidden bg-background">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-muted/30 dark:from-muted/10 to-transparent" />

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main content */}
          <div className="grid md:grid-cols-3 gap-12 mb-16">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-8 h-8">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-80" />
                  <div className="absolute inset-1 rounded-full bg-card/90 dark:bg-card/80 flex items-center justify-center border border-border/30">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-br from-primary to-secondary" />
                  </div>
                </div>
                <span className="text-lg font-medium tracking-wide text-foreground/90">
                  Aura
                </span>
              </div>
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Transforming urban spaces through collective consciousness and AI-powered restoration.
              </p>
            </div>

            {/* Links */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground/70 uppercase tracking-wider">
                Platform
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#pulse" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
                    How it Works
                  </a>
                </li>
                <li>
                  <a href="#impact" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
                    Community Impact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground/70 uppercase tracking-wider">
                Connect
              </h4>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
                    Support
                  </a>
                </li>
                <li>
                  <a href="/partners" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
                    Partner with Us
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-light">
                    Municipal Integration
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-8" />

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground/70 font-light">
            <p>© 2025 Aura. A civic initiative for Pune.</p>
            <p className="flex items-center gap-2">
              Made with 
              <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-primary to-secondary animate-breath" />
              for cleaner cities
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default AuraFooter;
