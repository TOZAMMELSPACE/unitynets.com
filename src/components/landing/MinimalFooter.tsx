import { memo } from "react";
import { Link } from "react-router-dom";

const linkGroups = [
  {
    title: "Platform",
    links: [
      { to: "/about", label: "About" },
      { to: "/feed", label: "Feed" },
      { to: "/learning-zone", label: "Learning Zone" },
    ],
  },
  {
    title: "Community",
    links: [
      { to: "/ambassador", label: "Ambassador Program" },
      { to: "/contribute", label: "Contribute" },
      { to: "/donation", label: "Donation" },
    ],
  },
  {
    title: "Legal & Admin",
    links: [
      { to: "/terms", label: "Terms" },
      { to: "/admin/ambassador", label: "Admin" },
    ],
  },
];

const MinimalFooter = memo(() => {
  return (
    <footer className="border-t border-border/30 bg-card/20 backdrop-blur-sm py-10 md:py-14">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid gap-10 md:gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="text-center md:text-left max-w-sm mx-auto md:mx-0">
            <Link to="/" className="inline-flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="UnityNets" className="h-9 w-auto" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A free global community where people share knowledge, build trust, and grow together.
            </p>
          </div>

          {linkGroups.map((group) => (
            <nav key={group.title} className="text-center md:text-left">
              <h4 className="text-sm font-semibold text-foreground mb-3">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} UnityNets. Building peace, one connection at a time.</p>
          <p>Trust • Learn • Unite</p>
        </div>
      </div>
    </footer>
  );
});

MinimalFooter.displayName = "MinimalFooter";
export default MinimalFooter;
