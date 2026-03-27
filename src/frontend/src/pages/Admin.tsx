import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Coins,
  Crown,
  Film,
  ShieldAlert,
  Trash2,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { UserRole } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useIsAdmin } from "../hooks/useQueries";
import { DURATION_OPTIONS, useAppStore } from "../store/appStore";

const MOCK_USERS = [
  { principal: "rdmx6-jaaaa-aaaah-qcaiq-cai", role: "admin", credits: 5000 },
  { principal: "gzqxh-wyaaa-aaaab-qaclq-cai", role: "user", credits: 280 },
  { principal: "rkp4c-7iaaa-aaaaa-aaaca-cai", role: "user", credits: 150 },
  { principal: "qhbym-qaaaa-aaaaa-aaafq-cai", role: "user", credits: 300 },
  { principal: "mxzaz-hqaaa-aaaar-qaada-cai", role: "guest", credits: 0 },
];

export default function Admin() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  const { actor } = useActor();
  const { videos, deleteVideo, setCredits } = useAppStore();
  const [creditInputs, setCreditInputs] = useState<Record<string, string>>({});
  const [users, setUsers] = useState(MOCK_USERS);
  const totalCredits = users.reduce((sum, u) => sum + u.credits, 0);

  const principal = identity?.getPrincipal().toString() || "";

  if (adminLoading) {
    return (
      <div className="p-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-96 gap-4"
        data-ocid="admin.unauthorized.panel"
      >
        <ShieldAlert size={48} className="text-destructive" />
        <div className="font-display font-bold text-xl text-foreground">
          Access Denied
        </div>
        <div className="text-muted-foreground text-sm">
          You need admin privileges to access this page.
        </div>
      </div>
    );
  }

  const handleSetCredits = (userPrincipal: string) => {
    const amount = Number.parseInt(creditInputs[userPrincipal] || "0");
    if (Number.isNaN(amount) || amount < 0) {
      toast.error("Invalid credit amount");
      return;
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.principal === userPrincipal ? { ...u, credits: amount } : u,
      ),
    );
    if (userPrincipal === principal) setCredits(principal, amount);
    toast.success(`Credits updated for ${userPrincipal.slice(0, 12)}...`);
    setCreditInputs((prev) => ({ ...prev, [userPrincipal]: "" }));
  };

  const handleToggleRole = async (
    userPrincipal: string,
    currentRole: string,
  ) => {
    const newRole = currentRole === "admin" ? UserRole.user : UserRole.admin;
    try {
      if (actor) {
        const { Principal } = await import("@icp-sdk/core/principal");
        await actor.assignCallerUserRole(
          Principal.fromText(userPrincipal),
          newRole,
        );
      }
      setUsers((prev) =>
        prev.map((u) =>
          u.principal === userPrincipal ? { ...u, role: newRole } : u,
        ),
      );
      toast.success(`Role updated to ${newRole}`);
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleDeleteVideo = (id: string, title: string) => {
    deleteVideo(id);
    toast.success(`Video "${title}" deleted`);
  };

  const truncate = (s: string) =>
    s.length > 20 ? `${s.slice(0, 10)}...${s.slice(-6)}` : s;

  return (
    <div className="p-5 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-1">
            Admin Panel
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage users, videos, and platform stats
          </p>
        </div>

        <Tabs defaultValue="stats">
          <TabsList className="bg-card border border-border mb-6">
            <TabsTrigger
              value="stats"
              className="gap-2"
              data-ocid="admin.stats.tab"
            >
              <BarChart3 size={14} />
              Stats
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="gap-2"
              data-ocid="admin.users.tab"
            >
              <Users size={14} />
              Users
            </TabsTrigger>
            <TabsTrigger
              value="videos"
              className="gap-2"
              data-ocid="admin.videos.tab"
            >
              <Film size={14} />
              Videos
            </TabsTrigger>
          </TabsList>

          {/* Stats */}
          <TabsContent value="stats">
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-5"
              data-ocid="admin.stats.panel"
            >
              {[
                {
                  label: "Total Users",
                  value: users.length,
                  icon: Users,
                  color: "text-primary",
                },
                {
                  label: "Total Videos",
                  value: videos.length,
                  icon: Film,
                  color: "text-gold",
                },
                {
                  label: "Total Credits Issued",
                  value: totalCredits.toLocaleString(),
                  icon: Coins,
                  color: "text-destructive",
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className="bg-card border border-border rounded-xl p-6"
                  >
                    <div className={`${stat.color} mb-3`}>
                      <Icon size={24} />
                    </div>
                    <div className="font-display font-black text-3xl text-foreground mb-1">
                      {stat.value}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* Users */}
          <TabsContent value="users">
            <div
              className="bg-card border border-border rounded-xl overflow-hidden"
              data-ocid="admin.users.table"
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Principal
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Role
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Credits
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, i) => (
                    <TableRow
                      key={user.principal}
                      className="border-border"
                      data-ocid={`admin.user.row.${i + 1}`}
                    >
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {truncate(user.principal)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "admin" ? "default" : "outline"
                          }
                          className={
                            user.role === "admin"
                              ? "bg-primary/20 text-primary border-primary/30"
                              : "border-border text-muted-foreground"
                          }
                        >
                          {user.role === "admin" && (
                            <Crown size={10} className="mr-1" />
                          )}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground font-semibold">
                        {user.credits.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            placeholder="Credits"
                            value={creditInputs[user.principal] || ""}
                            onChange={(e) =>
                              setCreditInputs((prev) => ({
                                ...prev,
                                [user.principal]: e.target.value,
                              }))
                            }
                            className="w-20 bg-background border border-border rounded px-2 py-1 text-xs text-foreground"
                            data-ocid={`admin.credits_${i + 1}.input`}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleSetCredits(user.principal)}
                            data-ocid={`admin.save_credits.${i + 1}`}
                          >
                            <Coins size={11} className="mr-1" />
                            Set
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() =>
                              handleToggleRole(user.principal, user.role)
                            }
                            data-ocid={`admin.toggle_role.${i + 1}`}
                          >
                            <Crown size={11} className="mr-1" />
                            {user.role === "admin" ? "Demote" : "Promote"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Videos */}
          <TabsContent value="videos">
            <div
              className="bg-card border border-border rounded-xl overflow-hidden"
              data-ocid="admin.videos.table"
            >
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">
                      Title
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Category
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Style
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Duration
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {videos.map((video, i) => {
                    const dur = DURATION_OPTIONS.find(
                      (d) => d.value === video.durationSeconds,
                    );
                    return (
                      <TableRow
                        key={video.id}
                        className="border-border"
                        data-ocid={`admin.video.row.${i + 1}`}
                      >
                        <TableCell className="text-foreground text-sm font-medium max-w-36 truncate">
                          {video.title}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {video.category}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-xs border-border text-muted-foreground"
                          >
                            {video.style}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {dur?.label || `${video.durationSeconds}s`}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${
                              video.status === "completed"
                                ? "bg-green-500/15 text-green-400 border-green-500/30"
                                : video.status === "processing"
                                  ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                                  : "bg-destructive/15 text-destructive border-destructive/30"
                            }`}
                          >
                            {video.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {!video.isSample && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() =>
                                handleDeleteVideo(video.id, video.title)
                              }
                              data-ocid={`admin.delete_video.${i + 1}`}
                            >
                              <Trash2 size={13} />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <footer className="border-t border-border pt-6 mt-10 text-center text-xs text-muted-foreground">
        &copy; {new Date().getFullYear()}. Built with &#9829; using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
