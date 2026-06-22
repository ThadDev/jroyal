import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { formatDate, estimateReadTime } from "@/lib/utils";
import type { BlogPost } from "@/types";
import CTABanner from "@/components/sections/CTABanner";

export const metadata: Metadata = {
    title: "Blog – Stories, Recipes & News",
    description:
        "Read stories, culinary insights, and news from the team at Jroyal Grills.",
};

// Static fallback blog posts for when Supabase isn't connected
const fallbackPosts: BlogPost[] = [
    {
        id: "1",
        title: "The Art of Perfecting Jollof Rice",
        slug: "art-of-perfecting-jollof-rice",
        excerpt: "Explore the secrets behind our legendary smoky jollof rice that keeps guests coming back time and again.",
        content: "",
        cover_image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80",
        published: true,
        author_id: null,
        created_at: "2025-12-01T00:00:00Z",
        updated_at: "2025-12-01T00:00:00Z",
    },
    {
        id: "2",
        title: "Why Nsukka is Nigeria's Hidden Culinary Gem",
        slug: "nsukka-hidden-culinary-gem",
        excerpt: "A deep dive into Nsukka's vibrant food culture and why the city is fast becoming a destination for food lovers.",
        content: "",
        cover_image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80",
        published: true,
        author_id: null,
        created_at: "2025-11-15T00:00:00Z",
        updated_at: "2025-11-15T00:00:00Z",
    },
    {
        id: "3",
        title: "Planning the Perfect Private Dining Experience",
        slug: "planning-perfect-private-dining",
        excerpt: "From menu selection to table settings — our guide to creating a memorable private dining occasion.",
        content: "",
        cover_image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=600&q=80",
        published: true,
        author_id: null,
        created_at: "2025-11-01T00:00:00Z",
        updated_at: "2025-11-01T00:00:00Z",
    },
    {
        id: "4",
        title: "Seasonal Ingredients: Farm to Table in Enugu",
        slug: "seasonal-ingredients-farm-to-table-enugu",
        excerpt: "How our chefs work with local farmers to source the freshest seasonal produce for our daily menus.",
        content: "",
        cover_image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80",
        published: true,
        author_id: null,
        created_at: "2025-10-20T00:00:00Z",
        updated_at: "2025-10-20T00:00:00Z",
    },
    {
        id: "5",
        title: "Our Pepper Soup Recipe — A Heritage Dish",
        slug: "pepper-soup-heritage-recipe",
        excerpt: "We share the story behind our beloved catfish pepper soup and some tips to recreate it at home.",
        content: "",
        cover_image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80",
        published: true,
        author_id: null,
        created_at: "2025-10-05T00:00:00Z",
        updated_at: "2025-10-05T00:00:00Z",
    },
    {
        id: "6",
        title: "Hosting a Corporate Dinner: Insider Tips",
        slug: "hosting-corporate-dinner-tips",
        excerpt: "Everything you need to know to impress clients and colleagues with a flawless corporate dining experience.",
        content: "",
        cover_image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80",
        published: true,
        author_id: null,
        created_at: "2025-09-22T00:00:00Z",
        updated_at: "2025-09-22T00:00:00Z",
    },
];

async function getPosts(): Promise<BlogPost[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("published", true)
            .order("created_at", { ascending: false });
        if (error || !data || data.length === 0) return fallbackPosts;
        return data;
    } catch {
        return fallbackPosts;
    }
}

export default async function BlogPage() {
    const posts = await getPosts();
    const [featured, ...rest] = posts;

    return (
        <div className="min-h-screen bg-obsidian pt-24">
            {/* Header */}
            <div className="section-padding pb-0 text-center">
                <p className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-4">From Our Kitchen</p>
                <h1 className="section-title mb-4">
                    Stories, Recipes &<span className="block gold-gradient-text italic">Culinary Insights</span>
                </h1>
                <p className="section-subtitle max-w-xl mx-auto">
                    Discover the stories, traditions, and culinary techniques behind the Jroyal Grills experience.
                </p>
            </div>

            <div className="section-padding">
                <div className="container-wide">
                    {/* Featured Post */}
                    {featured && (
                        <Link
                            href={`/blog/${featured.slug}`}
                            className="group grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/5 hover:border-gold-700/30 transition-colors duration-300 mb-12"
                        >
                            <div className="relative h-64 lg:h-auto min-h-[280px] overflow-hidden">
                                {featured.cover_image && (
                                    <Image
                                        src={featured.cover_image}
                                        alt={featured.title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        sizes="(max-width: 1024px) 100vw, 50vw"
                                        priority
                                    />
                                )}
                                <div className="absolute inset-0 bg-obsidian/20" />
                                <span className="absolute top-4 left-4 bg-gold-500 text-obsidian text-[10px] font-bold px-3 py-1 uppercase tracking-wider">
                                    Featured
                                </span>
                            </div>
                            <div className="bg-charcoal p-8 lg:p-12 flex flex-col justify-center">
                                <p className="text-gold-600 text-xs tracking-widest uppercase mb-4">
                                    {formatDate(featured.created_at)}
                                </p>
                                <h2 className="font-serif text-2xl lg:text-3xl font-bold text-white group-hover:text-gold-400 transition-colors duration-300 mb-4 line-clamp-3">
                                    {featured.title}
                                </h2>
                                {featured.excerpt && (
                                    <p className="text-white/50 leading-relaxed mb-6 line-clamp-3">{featured.excerpt}</p>
                                )}
                                <span className="text-gold-500 text-sm flex items-center gap-2">
                                    Read Article <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                                </span>
                            </div>
                        </Link>
                    )}

                    {/* Post Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
                        {rest.map((post) => (
                            <Link
                                key={post.id}
                                href={`/blog/${post.slug}`}
                                className="group bg-charcoal border border-white/5 hover:border-gold-700/30 transition-all duration-300 overflow-hidden"
                            >
                                {post.cover_image && (
                                    <div className="relative h-48 overflow-hidden">
                                        <Image
                                            src={post.cover_image}
                                            alt={post.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                        <div className="absolute inset-0 bg-obsidian/20" />
                                    </div>
                                )}
                                <div className="p-6">
                                    <p className="text-gold-600 text-[10px] tracking-widest uppercase mb-3">
                                        {formatDate(post.created_at)}
                                        {post.content ? ` · ${estimateReadTime(post.content)} min read` : ""}
                                    </p>
                                    <h3 className="font-serif text-lg font-semibold text-white group-hover:text-gold-400 transition-colors duration-300 mb-3 line-clamp-2">
                                        {post.title}
                                    </h3>
                                    {post.excerpt && (
                                        <p className="text-white/40 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
                                    )}
                                    <p className="text-gold-600 text-xs mt-4 flex items-center gap-1">
                                        Read More <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <CTABanner
                title="Hungry for More?"
                subtitle="Experience the dishes we write about — reserve your table at Jroyal Grills."
                primaryLabel="Make a Reservation"
                primaryHref="/reservations"
                secondaryLabel="View Our Menu"
                secondaryHref="/menu"
            />
        </div>
    );
}
