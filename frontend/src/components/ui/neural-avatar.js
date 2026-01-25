import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';

export const NeuralAvatar = ({ state = 'idle', size = 'md' }) => {
    // state: 'idle' | 'listening' | 'processing' | 'speaking'
    // size: 'sm' | 'md' | 'lg'

    const controls = useAnimation();
    const innerControls = useAnimation();

    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-32 h-32',
        lg: 'w-64 h-64'
    };

    const colors = {
        idle: '#06b6d4', // cyan
        listening: '#10b981', // emerald
        processing: '#d946ef', // fuchsia
        speaking: '#3b82f6', // blue
    };

    useEffect(() => {
        switch (state) {
            case 'idle':
                controls.start({
                    scale: [1, 1.05, 1],
                    rotate: [0, 5, -5, 0],
                    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                });
                innerControls.start({
                    scale: [1, 0.8, 1],
                    opacity: [0.5, 0.8, 0.5],
                    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                });
                break;
            case 'listening':
                controls.start({
                    scale: [1, 1.2, 1],
                    transition: { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
                });
                innerControls.start({
                    scale: [1, 1.5, 1],
                    opacity: [0.8, 1, 0.8],
                    transition: { duration: 0.2, repeat: Infinity }
                });
                break;
            case 'processing':
                controls.start({
                    rotate: 360,
                    scale: [1, 0.9, 1],
                    transition: { rotate: { duration: 2, repeat: Infinity, ease: "linear" }, scale: { duration: 1, repeat: Infinity } }
                });
                innerControls.start({
                    rotate: -360,
                    transition: { duration: 4, repeat: Infinity, ease: "linear" }
                });
                break;
            case 'speaking':
                controls.start({
                    scale: [1, 1.1, 0.9, 1.2, 1],
                    transition: { duration: 0.4, repeat: Infinity, ease: "easeInOut" }
                });
                innerControls.start({
                    opacity: [0.4, 0.9, 0.4],
                    transition: { duration: 0.2, repeat: Infinity }
                });
                break;
            default:
                break;
        }
    }, [state, controls, innerControls]);

    return (
        <div className={`relative flex items-center justify-center ${sizeClasses[size]}`}>
            {/* Outer Glow Ring */}
            <motion.div
                animate={controls}
                className="absolute inset-0 rounded-full blur-xl opacity-50 transition-colors duration-500"
                style={{ backgroundColor: colors[state] }}
            />

            {/* Core Ring 1 */}
            <motion.div
                animate={controls}
                className="absolute inset-2 rounded-full border-2 border-white/20 backdrop-blur-sm transition-colors duration-500"
                style={{ borderColor: colors[state], boxShadow: `0 0 20px ${colors[state]}` }}
            />

            {/* Core Ring 2 (Rotating) */}
            <motion.div
                animate={state === 'processing' ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-4 rounded-full border border-white/40 border-t-transparent border-b-transparent"
            />

            {/* Inner Core */}
            <motion.div
                animate={innerControls}
                className="absolute inset-8 rounded-full bg-white transition-colors duration-500"
                style={{
                    backgroundColor: state === 'idle' ? '#fff' : colors[state],
                    boxShadow: `0 0 30px ${colors[state]}`
                }}
            />

            {/* Particle Effects (CSS only for perf) */}
            <div className="absolute inset-[-50%] pointer-events-none overflow-hidden rounded-full opacity-30">
                <div className="w-full h-full animate-spin-slow bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
            </div>
        </div>
    );
};
