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
    <footer className="border-t border-border/20 bg-card/10 py-2">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          {allLinks.map((link, i) => (
            <span key={link.to} className="flex items-center">
              <Link
                to={link.to}
                className="text-[11px] text-muted-foreground/60 hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
              {i < allLinks.length - 1 && (
                <span className="ml-2 w-px h-2.5 bg-border/30" />
              )}
            </span>
          ))}
        </div>
        <p className="text-center text-[10px] text-muted-foreground/40 mt-1">
          © {new Date().getFullYear()} UnityNets · Trust • Learn • Unite
        </p>
      </div>
    </footer>
  );
});

MinimalFooter.displayName = "MinimalFooter";
export default MinimalFooter;
