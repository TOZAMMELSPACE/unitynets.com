import { memo } from "react";
import { Link } from "react-router-dom";

const MinimalFooter = memo(() => {
  return (
    <footer className="border-t border-border/30 bg-card/20 backdrop-blur-sm py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
          <div className="text-center md:text-left max-w-sm">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="UnityNets" className="h-9 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A free global community where people share knowledge, build trust, and grow together.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">Mission</Link>
            <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms</Link>
            <Link to="/contribute" className="text-muted-foreground hover:text-primary transition-colors">Contact</Link>
          </nav>
        </div>

        <div className="mt-10 pt-6 border-t border-border/20 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} UnityNets. Building peace, one connection at a time.
        </div>
      </div>
    </footer>
  );
});

MinimalFooter.displayName = "MinimalFooter";
export default MinimalFooter;
