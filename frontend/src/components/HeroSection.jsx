import React, { useRef } from 'react';
import { UploadCloud, FileVideo, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const HeroSection = ({ onFileSelect }) => {
    const fileInputRef = useRef(null);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            onFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium mb-4">
                    <ShieldAlert className="w-4 h-4" />
                    <span>Advanced Violence Detection System</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">
                    Secure Your <br /> Video Streams
                </h1>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    Upload surveillance footage for instant, AI-powered violence analysis using our state-of-the-art CNN-LSTM architecture.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-full max-w-xl"
            >
                <div
                    className="relative group cursor-pointer"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-blue-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative glass-panel p-12 flex flex-col items-center gap-4 border-dashed border-2 border-slate-600 hover:border-red-500/50 transition-colors">
                        <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <UploadCloud className="w-8 h-8 text-blue-400" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-semibold text-white">Click to upload or drag & drop</h3>
                            <p className="text-sm text-slate-500">MP4, AVI, MOV (Max 100MB)</p>
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleChange}
                        accept="video/*"
                        className="hidden"
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default HeroSection;
