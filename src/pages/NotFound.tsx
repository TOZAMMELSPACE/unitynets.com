import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center max-w-md w-full">
        <h1 className="mb-4 text-6xl lg:text-8xl font-bold text-primary">404</h1>
        <p className="mb-6 text-xl lg:text-2xl text-foreground">Oops! Page not found</p>
        <p className="mb-8 text-sm lg:text-base text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a 
          href="/" 
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
