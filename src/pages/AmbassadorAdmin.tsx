import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Search, Loader2, ShieldAlert, RefreshCw, CheckCircle2, XCircle, Clock } from "lucide-react";
import { SEOHead } from "@/components/SEOHead";

type Application = {
  id: string;
  name: string;
  email: string;
  country: string;
  age: number;
  social_handle: string;
  why_ambassador: string;
  contribution: string;
  status: string;
  created_at: string;
};

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected"] as const;

const statusBadge = (status: string) => {
  switch (status) {
    case "approved":
      return <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"><CheckCircle2 className="h-3 w-3 mr-1" />Approved</Badge>;
    case "rejected":
      return <Badge className="bg-destructive/15 text-destructive border-destructive/30 hover:bg-destructive/20"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    default:
      return <Badge variant="outline" className="border-amber-500/40 text-amber-400"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
  }
};

const AmbassadorAdmin = () => {
  const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Application[]>([]);
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Application | null>(null);

  // Check admin role
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthChecking(false);
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
      setAuthChecking(false);
    };
    check();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ambassador_applications")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error("Failed to load applications");
      return;
    }
    setRows((data || []) as Application[]);
  };

  useEffect(() => {
    if (isAdmin) fetchData();
  }, [isAdmin]);

  const countries = useMemo(() => {
    const set = new Set(rows.map((r) => r.country));
    return ["all", ...Array.from(set).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (countryFilter !== "all" && r.country !== countryFilter) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.social_handle.toLowerCase().includes(q) ||
        r.country.toLowerCase().includes(q)
      );
    });
  }, [rows, search, countryFilter, statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from("ambassador_applications")
      .update({ status })
      .eq("id", id);
    if (error) {
      toast.error("Update failed");
      return;
    }
    toast.success(`Marked as ${status}`);
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    setSelected((s) => (s && s.id === id ? { ...s, status } : s));
  };

  // Gating screens
  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md text-center rounded-2xl border border-border/50 bg-card p-10 shadow-elegant">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 font-display text-2xl font-bold">Admin Access Required</h1>
          <p className="mt-2 text-muted-foreground">
            You need an admin role to view this page. Sign in with an admin account or contact the team to be granted access.
          </p>
          <Button className="mt-6" onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </div>
    );
  }

  const stats = {
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    approved: rows.filter((r) => r.status === "approved").length,
    rejected: rows.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEOHead title="Ambassador Applications | Admin" description="Review and manage Unity Ambassador applications." />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Ambassador Applications</h1>
            <p className="text-muted-foreground mt-1">Review and manage submitted applications.</p>
          </div>
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total },
            { label: "Pending", value: stats.pending },
            { label: "Approved", value: stats.approved },
            { label: "Rejected", value: stats.rejected },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/50 bg-card p-5">
              <div className="text-sm text-muted-foreground">{s.label}</div>
              <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name, email, handle, country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={countryFilter} onValueChange={setCountryFilter}>
            <SelectTrigger className="md:w-56">
              <SelectValue placeholder="All countries" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === "all" ? "All countries" : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-44">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? "All statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Social</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10"><Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" /></TableCell></TableRow>
              ) : filtered.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No applications match your filters.</TableCell></TableRow>
              ) : (
                filtered.map((r) => (
                  <TableRow
                    key={r.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => setSelected(r)}
                  >
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-muted-foreground">{r.email}</TableCell>
                    <TableCell>{r.country}</TableCell>
                    <TableCell>{r.age}</TableCell>
                    <TableCell className="text-muted-foreground">{r.social_handle}</TableCell>
                    <TableCell>{statusBadge(r.status)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(r.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <p className="text-sm text-muted-foreground mt-3">
          Showing {filtered.length} of {rows.length} applications
        </p>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selected.name}
                  {statusBadge(selected.status)}
                </DialogTitle>
                <DialogDescription>
                  Submitted {new Date(selected.created_at).toLocaleString()}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Email</div>
                    <div className="font-medium break-all">{selected.email}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Country</div>
                    <div className="font-medium">{selected.country}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Age</div>
                    <div className="font-medium">{selected.age}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Social Handle</div>
                    <div className="font-medium break-all">{selected.social_handle}</div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">Why do you want to be a Unity Ambassador?</div>
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                    {selected.why_ambassador}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">How will you contribute to unity in your region?</div>
                  <div className="rounded-lg border border-border/50 bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                    {selected.contribution}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                  <Button
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => updateStatus(selected.id, "approved")}
                    disabled={selected.status === "approved"}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => updateStatus(selected.id, "rejected")}
                    disabled={selected.status === "rejected"}
                  >
                    <XCircle className="h-4 w-4 mr-2" /> Reject
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(selected.id, "pending")}
                    disabled={selected.status === "pending"}
                  >
                    <Clock className="h-4 w-4 mr-2" /> Mark Pending
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AmbassadorAdmin;
