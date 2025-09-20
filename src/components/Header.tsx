import { User } from "@/lib/storage";

interface HeaderProps {
  currentUser: User | null;
  onSignOut: () => void;
}

export const Header = ({ currentUser, onSignOut }: HeaderProps) => {
  return (
    <header className="card-enhanced p-6 mb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            UnityNet
          </h1>
          <p className="text-muted-foreground text-bengali font-medium">
            Trust • Learn • Unite
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-semibold text-bengali">{currentUser.name}</div>
                <div className="trust-score">
                  Trust: {Math.round(currentUser.trustScore)}
                </div>
              </div>
              <button
                onClick={onSignOut}
                className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg 
                          transition-smooth text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="text-muted-foreground">Not signed in</div>
          )}
        </div>
      </div>
    </header>
  );
};