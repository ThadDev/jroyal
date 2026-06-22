"use client";
import { motion } from "framer-motion";
import { useBranch } from "@/context/BranchContext";

interface Props {
    /** Optional explicit src — if provided it overrides the branch map URL */
    src?: string;
    /** Optional heading override */
    title?: string;
}

export default function MapSection({ src, title }: Props) {
    const { branch } = useBranch();

    // Prefer branch context URL; fall back to explicit prop if provided
    const mapSrc = branch.mapsEmbedUrl || src || "https://maps.google.com/maps?q=Nsukka+Enugu+Nigeria&output=embed";
    const mapTitle = title ?? `Find ${branch.name}`;
    const mapAddress = branch.address;

    return (
        <section className="section-padding bg-charcoal" id="map">
            <div className="container-wide">
                <div className="text-center mb-10">
                    <p className="text-gold-500 text-xs tracking-[0.3em] uppercase mb-3">Location</p>
                    <h2 className="section-title">{mapTitle}</h2>
                    <p className="section-subtitle mt-3 max-w-md mx-auto">
                        {mapAddress}
                    </p>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                    className="relative border border-gold-700/20 overflow-hidden"
                    style={{ height: "400px" }}
                >
                    <iframe
                        src={mapSrc}
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: "invert(90%) hue-rotate(180deg) saturate(120%) brightness(85%)" }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title={`${branch.name} Location Map`}
                        id="google-map"
                    />
                </motion.div>
            </div>
        </section>
    );
}
