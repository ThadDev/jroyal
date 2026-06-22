"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { slugify, formatDate } from "@/lib/utils";
import { Plus, Edit2, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import type { BlogPost } from "@/types";

export default function AdminBlogPage() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<BlogPost | null>(null);
    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        title: "",
        slug: "",
        excerpt: "",
        content: "",
        cover_image: "",
        published: false,
    });

    const supabase = createClient();

    const fetchPosts = async () => {
        setLoading(true);
        const { data } = await supabase
            .from("blog_posts")
            .select("*")
            .order("created_at", { ascending: false });
        setPosts(data ?? []);
        setLoading(false);
    };

    useEffect(() => { fetchPosts(); }, []); // eslint-disable-line

    const openCreate = () => {
        setEditing(null);
        setForm({ title: "", slug: "", excerpt: "", content: "", cover_image: "", published: false });
        setShowForm(true);
    };

    const openEdit = (post: BlogPost) => {
        setEditing(post);
        setForm({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt ?? "",
            content: post.content ?? "",
            cover_image: post.cover_image ?? "",
            published: post.published,
        });
        setShowForm(true);
    };

    const handleTitleChange = (title: string) => {
        setForm((f) => ({ ...f, title, slug: editing ? f.slug : slugify(title) }));
    };

    const save = async () => {
        setSaving(true);
        if (editing) {
            await supabase.from("blog_posts").update({ ...form, updated_at: new Date().toISOString() }).eq("id", editing.id);
        } else {
            await supabase.from("blog_posts").insert([form]);
        }
        setSaving(false);
        setShowForm(false);
        fetchPosts();
    };

    const togglePublish = async (post: BlogPost) => {
        await supabase.from("blog_posts").update({ published: !post.published }).eq("id", post.id);
        fetchPosts();
    };

    const deletePost = async (id: string) => {
        if (!confirm("Delete this post? This cannot be undone.")) return;
        await supabase.from("blog_posts").delete().eq("id", id);
        fetchPosts();
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="font-serif text-2xl text-white">Blog Posts</h1>
                    <p className="text-white/40 text-sm mt-1">{posts.length} posts total</p>
                </div>
                <button onClick={openCreate} className="btn-primary text-xs gap-2" id="new-blog-post">
                    <Plus size={14} /> New Post
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-charcoal border border-gold-700/20 p-6 mb-8 space-y-4">
                    <h2 className="font-serif text-lg text-white">{editing ? "Edit Post" : "New Post"}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="label-dark">Title *</label>
                            <input
                                type="text"
                                value={form.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                className="input-dark"
                                placeholder="Post title"
                                id="blog-title"
                            />
                        </div>
                        <div>
                            <label className="label-dark">Slug *</label>
                            <input
                                type="text"
                                value={form.slug}
                                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                                className="input-dark"
                                placeholder="url-slug"
                                id="blog-slug"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="label-dark">Cover Image URL</label>
                        <input
                            type="url"
                            value={form.cover_image}
                            onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.value }))}
                            className="input-dark"
                            placeholder="https://..."
                            id="blog-cover"
                        />
                    </div>
                    <div>
                        <label className="label-dark">Excerpt</label>
                        <textarea
                            value={form.excerpt}
                            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                            rows={2}
                            className="input-dark resize-none"
                            placeholder="Short summary displayed in listings..."
                            id="blog-excerpt"
                        />
                    </div>
                    <div>
                        <label className="label-dark">Content</label>
                        <textarea
                            value={form.content}
                            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                            rows={10}
                            className="input-dark resize-y font-mono text-sm"
                            placeholder="Full post content (separate paragraphs with blank lines)..."
                            id="blog-content"
                        />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.published}
                            onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
                            className="w-4 h-4 accent-gold-500"
                            id="blog-published"
                        />
                        <span className="text-sm text-white/70">Publish immediately</span>
                    </label>
                    <div className="flex gap-3">
                        <button onClick={save} disabled={saving} className="btn-primary text-xs" id="save-blog-post">
                            {saving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : "Save Post"}
                        </button>
                        <button onClick={() => setShowForm(false)} className="btn-ghost text-xs">Cancel</button>
                    </div>
                </div>
            )}

            {/* Posts list */}
            <div className="bg-charcoal border border-white/5 overflow-x-auto">
                <table className="w-full admin-table min-w-[600px]">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Created</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={4} className="text-center py-10 text-white/30">Loading posts…</td></tr>
                        ) : posts.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-10 text-white/30">No blog posts yet. Create your first one!</td></tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id}>
                                    <td>
                                        <p className="font-medium text-white/80">{post.title}</p>
                                        <p className="text-white/30 text-xs">/{post.slug}</p>
                                    </td>
                                    <td>{formatDate(post.created_at)}</td>
                                    <td>
                                        <span className={`px-2 py-0.5 text-xs font-medium ${post.published ? "bg-green-500/20 text-green-400" : "bg-white/10 text-white/40"}`}>
                                            {post.published ? "Published" : "Draft"}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button onClick={() => togglePublish(post)} title={post.published ? "Unpublish" : "Publish"}
                                                className="p-1.5 text-white/40 hover:text-gold-400 transition-colors" id={`toggle-${post.id}`}>
                                                {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                                            </button>
                                            <button onClick={() => openEdit(post)} title="Edit"
                                                className="p-1.5 text-white/40 hover:text-blue-400 transition-colors" id={`edit-${post.id}`}>
                                                <Edit2 size={14} />
                                            </button>
                                            <button onClick={() => deletePost(post.id)} title="Delete"
                                                className="p-1.5 text-white/40 hover:text-red-400 transition-colors" id={`delete-${post.id}`}>
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
