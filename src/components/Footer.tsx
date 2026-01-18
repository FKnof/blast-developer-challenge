export function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-center gap-3">
          {/* Logo */}
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="h-8 w-auto"
          />
          
          {/* Text */}
          <span className="font-tabs text-sm text-muted-foreground">
            BLAST developer challenge – Fabian Knof
          </span>
        </div>
      </div>
    </footer>
  );
}
