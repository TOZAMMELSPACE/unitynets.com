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
    <footer className="border-t border-border/30 bg-card/20 py-3">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
          {allLinks.map((link, i) => (
            <span key={link.to} className="flex items-center">
              <Link
                to={link.to}
                className="text-sm text-muted-foreground/70 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
              {i < allLinks.length - 1 && (
                <span className="ml-3 w-px h-3.5 bg-border/40" />
              )}
            </span>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground/50 mt-1.5">
          © {new Date().getFullYear()} UnityNets · Trust • Learn • Unite
        </p>
      </div>
    </footer>
  );
});

MinimalFooter.displayName = "MinimalFooter";
export default MinimalFooter;
