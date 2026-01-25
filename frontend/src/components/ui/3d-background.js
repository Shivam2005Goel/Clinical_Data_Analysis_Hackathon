import React from 'react';

/**
 * Premium Animated Background Component
 * CSS-based starfield with floating aurora orbs for a jaw-dropping effect
 */
const Background3D = () => {
    return (
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
            {/* Base Starfield */}
            <div className="starfield" />

            {/* Floating Aurora Orbs */}
            <div className="aurora-orb aurora-orb-1" />
            <div className="aurora-orb aurora-orb-2" />
            <div className="aurora-orb aurora-orb-3" />

            {/* Mesh Gradient Overlay */}
            <div
                className="absolute inset-0 opacity-60"
                style={{
                    background: `
                        radial-gradient(at 40% 20%, rgba(0, 243, 255, 0.08) 0px, transparent 50%),
                        radial-gradient(at 80% 0%, rgba(188, 19, 254, 0.1) 0px, transparent 50%),
                        radial-gradient(at 0% 50%, rgba(0, 102, 255, 0.08) 0px, transparent 50%),
                        radial-gradient(at 90% 80%, rgba(255, 0, 170, 0.06) 0px, transparent 50%),
                        radial-gradient(at 20% 90%, rgba(0, 243, 255, 0.06) 0px, transparent 50%)
                    `
                }}
            />

            {/* Bottom Gradient Fade */}
            <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-transparent" />

            {/* Subtle Vignette */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 0%, rgba(3,7,18,0.4) 100%)'
                }}
            />
        </div>
    );
};

export default Background3D;
