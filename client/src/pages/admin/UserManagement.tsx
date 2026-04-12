import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Breadcrumbs";
import Loading from "../../components/Loading";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import { toastUI } from "../../components/ui/Toast";
import { useAuth } from "../../hooks/useAuth";
import { getAdminUserDetail, listAdminUsers, toggleAdminUserStatus, updateAdminUserRole } from "../../services/admin";
import type { User, UserRole } from "../../types/models";

const roleOptions: UserRole[] = ["job_seeker", "employer", "mentor", "admin"];

function roleLabel(role: UserRole) {
  return role.replace("_", " ");
}

function parseUserId(value: string | undefined): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export default function UserManagement() {
  const navigate = useNavigate();
  const params = useParams();
  const routeUserId = parseUserId(params.userId);

  const { user, isLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [statusFilter, setStatusFilter] = useState<User["status"] | "all">("all");

  useEffect(() => {
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadUsers() {
      try {
        const response = await listAdminUsers({
          search: search.trim() || undefined,
          role: roleFilter,
          status: statusFilter,
        });

        if (!cancelled) {
          setUsers(response.users);
        }
      } catch {
        if (!cancelled) {
          setUsers([]);
          toastUI.error("Could not load users.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadUsers();

    return () => {
      cancelled = true;
    };
  }, [roleFilter, search, statusFilter, user]);

  useEffect(() => {
    if (!routeUserId || !user || user.role !== "admin") {
      return;
    }
    const currentUserId = routeUserId;

    let cancelled = false;

    async function loadDetail() {
      try {
        const response = await getAdminUserDetail(currentUserId);
        if (!cancelled) {
          setSelectedUser(response.user);
        }
      } catch {
        if (!cancelled) {
          toastUI.error("Could not load user detail.");
        }
      }
    }

    void loadDetail();

    return () => {
      cancelled = true;
    };
  }, [routeUserId, user]);

  const userStats = useMemo(
    () => ({
      total: users.length,
      active: users.filter((item) => item.status === "active").length,
      suspended: users.filter((item) => item.status !== "active").length,
    }),
    [users]
  );

  async function handleRoleChange(target: User, role: UserRole) {
    try {
      const response = await updateAdminUserRole(target.id, role);

      setUsers((current) => current.map((item) => (item.id === target.id ? response.user : item)));
      setSelectedUser((current) => (current && current.id === target.id ? response.user : current));
      toastUI.success(`Role updated to ${roleLabel(role)}.`);
    } catch {
      toastUI.error("Could not update user role.");
    }
  }

  async function handleStatusToggle(target: User) {
    try {
      const response = await toggleAdminUserStatus(target.id);

      setUsers((current) => current.map((item) => (item.id === target.id ? response.user : item)));
      setSelectedUser((current) => (current && current.id === target.id ? response.user : current));
      toastUI.success(`User is now ${response.user.status}.`);
    } catch {
      toastUI.error("Could not update user status.");
    }
  }

  if (isLoading || loading) {
    return <Loading label="Loading user management..." />;
  }

  if (!user || user.role !== "admin") {
    return (
      <Card title="Admin Access Required" subtitle="This section is available to admin accounts only.">
        <Link to="/dashboard" className="btn btn-outline-primary">
          Back to dashboard
        </Link>
      </Card>
    );
  }

  return (
    <div className="vstack gap-3">
      <Breadcrumbs items={[{ label: "Dashboard", to: "/dashboard" }, { label: "User Management" }]} />

      <div className="row g-3">
        <div className="col-12 col-md-4">
          <Card title="Total users">
            <div className="display-6 mb-0">{userStats.total}</div>
          </Card>
        </div>
        <div className="col-12 col-md-4">
          <Card title="Active">
            <div className="display-6 mb-0">{userStats.active}</div>
          </Card>
        </div>
        <div className="col-12 col-md-4">
          <Card title="Suspended">
            <div className="display-6 mb-0">{userStats.suspended}</div>
          </Card>
        </div>
      </div>

      <Card title="Users" subtitle="Filter users, update roles, and suspend or reactivate accounts.">
        <div className="row g-3 mb-3">
          <div className="col-12 col-lg-4">
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or email"
              aria-label="Search users"
            />
          </div>
          <div className="col-12 col-lg-4">
            <select className="form-select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value as UserRole | "all")}>
              <option value="all">All roles</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>{roleLabel(role)}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-lg-4">
            <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as User["status"] | "all")}>
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="banned">Suspended</option>
            </select>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ width: 320 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">No users found for the selected filters.</td>
                </tr>
              ) : (
                users.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="fw-semibold">{item.name}</div>
                      <div className="text-muted small">{item.email}</div>
                    </td>
                    <td>
                      <select
                        className="form-select form-select-sm"
                        value={item.role}
                        onChange={(event) => void handleRoleChange(item, event.target.value as UserRole)}
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>{roleLabel(role)}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`badge ${item.status === "active" ? "text-bg-success" : "text-bg-danger"}`}>
                        {item.status === "active" ? "active" : "suspended"}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <Button type="button" variant="outline" className="btn-sm" onClick={() => navigate(`/dashboard/users/${item.id}`)}>
                          View detail
                        </Button>
                        <Button
                          type="button"
                          variant={item.status === "active" ? "danger" : "secondary"}
                          className="btn-sm"
                          onClick={() => void handleStatusToggle(item)}
                        >
                          {item.status === "active" ? "Suspend" : "Activate"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="User Detail View" subtitle="Detailed view for admin review and quick actions.">
        {!selectedUser ? (
          <div className="text-muted">Select "View detail" from the table to inspect a user.</div>
        ) : (
          <div className="row g-3">
            <div className="col-12 col-lg-8">
              <div className="border rounded-3 p-3 h-100">
                <div className="h5 mb-1">{selectedUser.name}</div>
                <div className="text-muted mb-3">{selectedUser.email}</div>

                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <div className="text-muted small">Role</div>
                    <div className="fw-semibold text-capitalize">{roleLabel(selectedUser.role)}</div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="text-muted small">Status</div>
                    <div className="fw-semibold">{selectedUser.status}</div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="text-muted small">Skills</div>
                    <div className="fw-semibold">{selectedUser.skills.length}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-4">
              <div className="border rounded-3 p-3 h-100 d-flex flex-column gap-2">
                <Button type="button" variant="outline" onClick={() => navigate("/dashboard/users")}>Clear selection</Button>
                <Button
                  type="button"
                  variant={selectedUser.status === "active" ? "danger" : "secondary"}
                  onClick={() => void handleStatusToggle(selectedUser)}
                >
                  {selectedUser.status === "active" ? "Suspend user" : "Activate user"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
