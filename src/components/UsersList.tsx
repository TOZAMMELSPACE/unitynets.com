import { User } from "@/lib/storage";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Shield } from "lucide-react";

interface UsersListProps {
  users: User[];
  currentUserId?: string;
}

export const UsersList = ({ users, currentUserId }: UsersListProps) => {
  return (
    <div className="card-enhanced p-6">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Shield className="w-5 h-5 text-accent" />
        Verified Users
      </h3>
      
      {users.length === 0 ? (
        <p className="text-muted-foreground text-sm">No verified users yet</p>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                user.id === currentUserId
                  ? 'bg-accent/5 border-accent/20 shadow-md'
                  : 'bg-muted/20 border-border hover:bg-muted/40'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-trust rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-bengali text-sm">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.nidMasked}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs ${
                      user.trustScore >= 80 
                        ? 'bg-accent/10 text-accent' 
                        : user.trustScore >= 60 
                          ? 'bg-warning/10 text-warning'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {Math.round(user.trustScore)}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};