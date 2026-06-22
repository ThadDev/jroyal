import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-obsidian flex items-center justify-center px-4">
            <div className="text-center">
                <p className="text-gold-600/40 font-serif text-[120px] leading-none font-bold">404</p>
                <h1 className="font-serif text-3xl text-white mb-4 -mt-4">Page Not Found</h1>
                <p className="text-white/50 mb-8 max-w-sm mx-auto">
                    The page you're looking for doesn't exist or has been moved. Let's get you back on track.
                </p>
                <div className="flex items-center justify-center gap-4">
                    <Link href="/" className="btn-primary">Back to Home</Link>
                    <Link href="/contact" className="btn-ghost">Contact Us</Link>
                </div>
            </div>
        </div>
    );
}
