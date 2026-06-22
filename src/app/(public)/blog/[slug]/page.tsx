import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatDate, estimateReadTime } from "@/lib/utils";

interface Props {
    params: Promise<{ slug: string }>;
}

// Static fallback content
const fallbackContent: Record<string, { title: string; content: string; excerpt: string; cover_image: string }> = {
    "art-of-perfecting-jollof-rice": {
        title: "The Art of Perfecting Jollof Rice",
        excerpt: "Explore the secrets behind our legendary smoky jollof rice.",
        cover_image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
        content: `At Jroyal Grills, our jollof rice has become something of a legend — and rightly so. Every batch is a labour of love, a careful balance of technique, quality ingredients, and, most importantly, time.

The secret begins long before the rice is added to the pot. We start with a base of plum tomatoes, fresh tatashe (red bell peppers), scotch bonnets, and caramelised onions, all blended and reduced slowly over medium heat until the raw tomato taste is completely gone. This process — sautéing the base for 30–45 minutes — is what separates average jollof from extraordinary jollof.

Next comes the seasoning. We use a proprietary blend of spices that has been refined over years. The chicken stock is homemade — never from cubes alone — and gives the rice its deep, savoury foundation.

The "party" element, that coveted smoky bottom known as "party jollof," comes from the final stage of cooking: we deliberately allow the bottom of the pot to slightly char over high heat, imparting a subtle smokiness that permeates every grain.

Our advice? Be patient. Great jollof rice cannot be rushed.`,
    },
};

async function getPost(slug: string) {
    try {
        const supabase = await createClient();
        const { data } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("slug", slug)
            .eq("published", true)
            .single();
        return data;
    } catch {
        return null;
    }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPost(slug);
    const fb = fallbackContent[slug];
    const title = post?.title ?? fb?.title ?? "Blog Post";
    const description = post?.excerpt ?? fb?.excerpt ?? "";
    return {
        title,
        description,
        openGraph: {
            title: `${title} | Jroyal Grills`,
            description,
            images: post?.cover_image ? [{ url: post.cover_image }] : [],
        },
    };
}

export default async function BlogPostPage({ params }: Props) {
    const { slug } = await params;
    const post = await getPost(slug);
    const fb = fallbackContent[slug];

    if (!post && !fb) notFound();

    const title = post?.title ?? fb?.title ?? "";
    const content = post?.content ?? fb?.content ?? "";
    const excerpt = post?.excerpt ?? fb?.excerpt ?? "";
    const coverImage = post?.cover_image ?? fb?.cover_image ?? "";
    const createdAt = post?.created_at ?? new Date().toISOString();

    return (
        <div className="min-h-screen bg-obsidian pt-20">
            {/* Cover */}
            {coverImage && (
                <div className="relative h-[50vh] min-h-[340px] lg:h-[60vh]">
                    <Image
                        src={coverImage}
                        alt={title}
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/50 to-obsidian/10" />
                </div>
            )}

            {/* Article */}
            <article className="container-narrow px-4 sm:px-6 py-12 -mt-16 relative z-10">
                <div className="border border-white/5 bg-charcoal p-8 sm:p-12">
                    <p className="text-gold-600 text-xs tracking-widest uppercase mb-4">
                        {formatDate(createdAt)}
                        {content ? ` · ${estimateReadTime(content)} min read` : ""}
                    </p>
                    <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">{title}</h1>
                    {excerpt && (
                        <p className="text-white/60 text-lg leading-relaxed border-l-2 border-gold-600/40 pl-4 mb-8 italic">
                            {excerpt}
                        </p>
                    )}
                    <div className="h-px bg-gold-700/20 mb-8" />
                    {content ? (
                        <div className="prose prose-lg max-w-none">
                            {content.split("\n\n").map((paragraph: string, i: number) => (
                                <p key={i} className="text-white/70 leading-relaxed mb-6 text-base">
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                    ) : (
                        <p className="text-white/50 italic">Full article coming soon…</p>
                    )}
                </div>

                {/* Back to blog */}
                <div className="mt-8">
                    <Link href="/blog" className="btn-ghost text-gold-600 hover:text-gold-400">
                        ← Back to Blog
                    </Link>
                </div>
            </article>
        </div>
    );
}
