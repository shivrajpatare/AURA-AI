import { useState, useEffect } from "react";
import { BarChart3, Users, CheckCircle, Clock, MapPin, TrendingUp, AlertTriangle, RefreshCw, ArrowLeft, Sparkles, LogIn, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { User } from "@supabase/supabase-js";
import { AdminMapPanel, type MapReport } from "./admin/AdminMapPanel";
import { ReportDetailPanel } from "./admin/ReportDetailPanel";

interface AdminDashboardProps {
  onBack: () => void;
}

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
}

const categoryLabels: Record<string, string> = {
  garbage_dump: "Garbage Dump",
  dustbin_not_cleaned: "Dustbin",
  burning_garbage: "Burning",
  open_manhole: "Manhole",
  stagnant_water: "Stagnant Water",
  dead_animal: "Dead Animal",
  sewage_overflow: "Sewage",
  sweeping_not_done: "Sweeping",
  other: "Other",
};

const priorityEmoji: Record<string, string> = {
  low: "🟡",
  medium: "🟠",
  high: "🔴",
  critical: "🚨",
};

export const AdminDashboard = ({ onBack }: AdminDashboardProps) => {
  const [reports, setReports] = useState<MapReport[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<MapReport | null>(null);
  const [showHighPriorityOnly, setShowHighPriorityOnly] = useState(false);

  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Google Auth Handler
  const handleGoogleSignIn = async () => {
    setAuthError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      setAuthError(error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleEmailSignIn = async () => {
    setAuthLoading(true);
    setAuthError("");

    // Attempt sign in
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const fetchData = async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const { data: reportsData, error } = await supabase
        .from('public_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const allReports = (reportsData || []) as MapReport[];
      setReports(allReports);

      const newStats = {
        total: allReports.length,
        pending: allReports.filter(r => r.status === 'pending').length,
        inProgress: allReports.filter(r => r.status === 'in_progress').length,
        resolved: allReports.filter(r => r.status === 'resolved').length,
      };
      setStats(newStats);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Could not load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  // Check authentication and admin role
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          // AUTO-ADMIN for specific email
          if (session.user.email === 'shivrajgpatare@gmail.com') {
            setIsAdmin(true);
          } else {
            const { data: roles } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .eq('role', 'admin')
              .single();
            setIsAdmin(!!roles);
          }
        } else {
          setIsAdmin(false);
        }
        setAuthLoading(false);
      });

      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        // AUTO-ADMIN for specific email
        if (session.user.email === 'shivrajgpatare@gmail.com') {
          setIsAdmin(true);
        } else {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('role', 'admin')
            .single();
          setIsAdmin(!!roles);
        }
      }
      setAuthLoading(false);

      return () => subscription.unsubscribe();
    };
    checkAuth();
  }, []);

  // Show login form if not authenticated or not admin
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-secondary/10">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-drift" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-drift" style={{ animationDelay: "-5s" }} />
        </div>

        <header className="sticky top-0 z-10 px-4 pt-4">
          <div className="glass-panel rounded-2xl px-6 py-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="rounded-xl hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-medium text-lg text-foreground/90 tracking-wide">Admin Access</h1>
                <p className="text-xs text-foreground/50 font-light">Authentication Required</p>
              </div>
            </div>
          </div>
        </header>

        <main className="relative px-4 py-12 flex items-center justify-center">
          <div className="glass-panel rounded-2xl p-8 max-w-md w-full space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-medium text-foreground/90">
                Admin Portal
              </h2>
              <p className="text-sm text-foreground/50 font-light">
                {user ? "Checking permissions..." : "Sign in to access the control room"}
              </p>
            </div>

            {user ? (
              <div className="space-y-4">
                <p className="text-center text-sm text-foreground/60">
                  Signed in as: {user.email}
                </p>
                {!isAdmin && (
                  <p className="text-center text-xs text-warning">
                    Access Denied. You are not an admin.
                  </p>
                )}
                <Button onClick={handleSignOut} variant="outline" className="w-full rounded-xl">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  onClick={handleGoogleSignIn}
                  className="w-full rounded-xl bg-white text-black hover:bg-white/90 shadow-md transition-all h-12 relative overflow-hidden group mb-4"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 mr-3" />
                  Sign in with Google
                </Button>

                <div className="relative flex items-center gap-2 py-2">
                  <div className="h-px bg-foreground/10 flex-1" />
                  <span className="text-xs text-foreground/40 font-light">OR</span>
                  <div className="h-px bg-foreground/10 flex-1" />
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleEmailSignIn(); }} className="space-y-3">
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/5 border-white/10 text-foreground"
                    required
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/10 text-foreground"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full rounded-xl"
                    disabled={authLoading}
                  >
                    {authLoading ? "Signing in..." : "Sign in with Email"}
                  </Button>
                </form>

                {authError && (
                  <p className="text-sm text-destructive text-center bg-destructive/10 p-2 rounded-lg">{authError}</p>
                )}
              </div>
            )}

            <p className="text-xs text-center text-foreground/30 font-light">
              Authorized Personnel Only
            </p>
          </div>
        </main>
      </div>
    );
  }

  const handleUpdateStatus = async (reportId: string, newStatus: string, additionalData?: Record<string, any>) => {
    try {
      const updateData: Record<string, unknown> = {
        status: newStatus,
        ...additionalData
      };
      if (newStatus === 'resolved' && !updateData.resolved_at) {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Report marked as ${newStatus.replace('_', ' ')}`,
      });

      setSelectedReport(null);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const handleSelectReportFromList = (report: MapReport) => {
    setSelectedReport(report);
  };

  const handleSelectReportFromMap = (report: MapReport) => {
    setSelectedReport(report);
  };

  const statsConfig = [
    { label: "Total Reports", value: stats.total, icon: BarChart3, gradient: "from-primary/20 to-secondary/20" },
    { label: "Pending", value: stats.pending, icon: Clock, gradient: "from-warning/20 to-orange-500/20" },
    { label: "In Progress", value: stats.inProgress, icon: TrendingUp, gradient: "from-secondary/20 to-blue-500/20" },
    { label: "Resolved", value: stats.resolved, icon: CheckCircle, gradient: "from-success/20 to-emerald-500/20" },
  ];

  const recentReports = reports.slice(0, 15);
  const criticalCount = reports.filter(r => r.priority === 'critical' || r.priority === 'high').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-secondary/10">
      {/* Ambient background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-drift" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-drift" style={{ animationDelay: "-5s" }} />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-10 px-4 pt-4">
        <div className="glass-panel rounded-2xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={onBack} className="rounded-xl hover:bg-white/10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="font-medium text-lg text-foreground/90 tracking-wide">City Control Room</h1>
                <p className="text-xs text-foreground/50 font-light">Signed in as {user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {criticalCount > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 mr-2">
                  <AlertTriangle className="w-4 h-4 text-destructive animate-pulse" />
                  <span className="text-sm font-medium text-destructive">{criticalCount}</span>
                  <span className="text-xs text-destructive/70 hidden sm:inline">critical</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl hover:bg-white/10 text-foreground/60"
                onClick={fetchData}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl hover:bg-white/10 text-foreground/60"
                onClick={handleSignOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsConfig.map((stat, index) => (
            <div key={index} className="glass-panel p-5 rounded-2xl group hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground/50 font-light">{stat.label}</p>
                  <p className="text-3xl font-light mt-2 text-foreground/90">
                    {loading ? '-' : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6 text-foreground/60" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout - Reports List + Map */}
        <div className="grid lg:grid-cols-2 gap-6" style={{ minHeight: '600px' }}>
          {/* Left Column - Reports List */}
          <div className="glass-panel rounded-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="font-medium text-foreground/80 tracking-wide">Recent Reports</h2>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card">
                <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                <span className="text-xs font-light text-foreground/60">{recentReports.length} reports</span>
              </div>
            </div>
            <div className="divide-y divide-white/5 flex-1 overflow-y-auto max-h-[500px]">
              {loading ? (
                <div className="p-10 flex justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                </div>
              ) : recentReports.length === 0 ? (
                <div className="p-10 text-center text-foreground/50">No reports yet</div>
              ) : (
                recentReports.map((report) => (
                  <button
                    key={report.id}
                    onClick={() => handleSelectReportFromList(report)}
                    className={`w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-all text-left ${selectedReport?.id === report.id ? 'bg-primary/10 border-l-2 border-primary' : ''
                      }`}
                  >
                    <div className={`w-3 h-3 rounded-full shrink-0 ${report.priority === 'critical' || report.priority === 'high' ? 'bg-destructive animate-pulse' :
                      report.priority === 'medium' ? 'bg-warning' : 'bg-amber-400'
                      }`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base">{priorityEmoji[report.priority] || '🟡'}</span>
                        <span className="px-2 py-0.5 rounded-full glass-card text-xs text-foreground/60">
                          {categoryLabels[report.category] || report.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-light ${report.status === 'resolved' ? 'bg-success/10 text-success' :
                          report.status === 'in_progress' ? 'bg-secondary/10 text-secondary' :
                            'bg-warning/10 text-warning'
                          }`}>
                          {report.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-foreground/40 mt-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="font-light truncate">{report.address || 'No address'}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-foreground/40 font-light">{formatDate(report.created_at)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Map */}
          <AdminMapPanel
            reports={reports}
            selectedReportId={selectedReport?.id || null}
            onSelectReport={handleSelectReportFromMap}
            showHighPriorityOnly={showHighPriorityOnly}
            onToggleHighPriority={setShowHighPriorityOnly}
          />
        </div>
      </main>

      {/* Report Detail Panel */}
      <ReportDetailPanel
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
        onUpdateStatus={handleUpdateStatus}
        categoryLabels={categoryLabels}
      />
    </div>
  );
};

export default AdminDashboard;
