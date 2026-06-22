"use client";
import { useState } from "react";
import { Users, Mail, Calendar, ShieldCheck, Search } from "lucide-react";

interface AdminUser {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
}

const roleColors: Record<string, string> = {
    admin: "bg-yellow-500/20 text-yellow-400",
    staff: "bg-blue-500/20 text-blue-400",
    customer: "bg-green-500/20 text-green-400",
};

export default function AdminUsersClient({ initialUsers }: { initialUsers: AdminUser[] }) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredUsers = initialUsers.filter((u) => {
        const lowerSearch = searchQuery.toLowerCase();
        return (
            u.full_name.toLowerCase().includes(lowerSearch) ||
            u.email.toLowerCase().includes(lowerSearch)
        );
    });

    return (
        <>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="font-serif text-2xl text-white">Users</h1>
                    <p className="text-white/40 text-sm mt-1">{filteredUsers.length} total</p>
                </div>
                <div className="flex items-center gap-2 bg-charcoal border border-white/5 px-4 py-2">
                    <Users size={14} className="text-gold-500" />
                    <span className="text-white/60 text-sm font-medium">{initialUsers.length} registered</span>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        placeholder="Search users by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-gold-500/50"
                    />
                </div>
            </div>

            <div className="bg-charcoal border border-white/5">
                <div className="overflow-x-auto">
                    <table className="w-full admin-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Signup Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center text-white/30 py-10">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="w-7 h-7 rounded-full bg-gold-600/20 border border-gold-600/30 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-gold-500 text-xs font-semibold">
                                                        {user.full_name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-white/80">{user.full_name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1.5 text-white/60">
                                                <Mail size={12} className="opacity-50" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td>
                                            <span
                                                className={`px-2 py-0.5 text-xs font-medium rounded-sm capitalize ${
                                                    roleColors[user.role] ?? "bg-gray-500/20 text-gray-400"
                                                }`}
                                            >
                                                <span className="flex items-center gap-1">
                                                    <ShieldCheck size={10} />
                                                    {user.role}
                                                </span>
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1.5 text-white/60">
                                                <Calendar size={12} className="opacity-50" />
                                                {user.created_at}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
