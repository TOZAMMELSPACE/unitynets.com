import { memo } from "react";
import { Link } from "react-router-dom";

const allLinks = [
  { to: "/about", label: "About" },
  { to: "/feed", label: "Feed" },
  { to: "/learning-zone", label: "Learning Zone" },
  { to: "/ambassador", label: "Ambassador" },
  { to: "/contribute", label: "Contribute" },
  { to: "/donation", label: "Donation" },
  { to: "/terms", label: "Terms" },
  { to: "/admin/ambassador", label: "Admin" },
];

const MinimalFooter = memo(() => {
  return (
    <footer className="border-t border-border/30 bg-card/20 backdrop-blur-sm py-6">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col items-center gap-3">
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-2">
            <img src="/logo.png" alt="UnityNets" className="h-7 w-auto" />
          </Link>

          {/* Links in one line */}
          <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {allLinks.map((link, i) => (
              <span key={link.to} className="flex items-center">
                <Link
                  to={link.to}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
                {i < allLinks.length - 1 && (
                  <span className="ml-3 w-px h-3 bg-border/40" />
                )}
              </span>
            ))}
          </nav>

          {/* Bottom line */}
          <div className="flex flex-col sm:flex-row items-center gap-1 text-[11px] text-muted-foreground/70">
            <p>© {new Date().getFullYear()} UnityNets. Building peace, one connection at a time.</p>
            <span className="hidden sm:inline mx-2">·</span>
            <p>Trust • Learn • Unite</p>
          </div>
        </div>
      </div>
    </footer>
  );
});

MinimalFooter.displayName = "MinimalFooter";
export default MinimalFooter;
