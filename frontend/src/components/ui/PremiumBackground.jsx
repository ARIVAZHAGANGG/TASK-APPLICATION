import React from 'react';
import { motion } from 'framer-motion';

const PremiumBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            {/* Base Background */}
            <div className="absolute inset-0 bg-[var(--bg-primary)]" />
            
            {/* Animated Mesh Blobs */}
            <motion.div
                animate={{
                    x: [0, 100, 0],
                    y: [0, 50, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[var(--bg-mesh-1)] blur-[120px] opacity-60"
            />
            
            <motion.div
                animate={{
                    x: [0, -80, 0],
                    y: [0, 120, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -top-[5%] -right-[10%] w-[45%] h-[45%] rounded-full bg-[var(--bg-mesh-2)] blur-[100px] opacity-50"
            />
            
            <motion.div
                animate={{
                    x: [0, 50, 0],
                    y: [0, -100, 0],
                    scale: [1, 1.3, 1],
                }}
                transition={{
                    duration: 22,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -bottom-[10%] -right-[5%] w-[55%] h-[55%] rounded-full bg-[var(--bg-mesh-3)] blur-[140px] opacity-40"
            />
            
            <motion.div
                animate={{
                    x: [0, -120, 0],
                    y: [0, -40, 0],
                    scale: [1, 1.2, 1],
                }}
                transition={{
                    duration: 28,
                    repeat: Infinity,
                    ease: "linear"
                }}
                className="absolute -bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-[var(--bg-mesh-4)] blur-[110px] opacity-50"
            />

            {/* Noise Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
            />
        </div>
    );
};

export default PremiumBackground;
