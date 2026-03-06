import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, AlertOctagon, CheckCircle, Clock, Loader2 } from 'lucide-react';

export default function AnalysisDashboard({ file, result, setResult, isAnalyzing, setIsAnalyzing }) {
    const [videoUrl, setVideoUrl] = useState(null);
    const [progress, setProgress] = useState(0);
    const urlRef = useRef(null);

    // Create blob URL on mount
    useEffect(() => {
        const url = URL.createObjectURL(file);
        urlRef.current = url;
        setVideoUrl(url);
        
        analyzeVideo();
        
        // Cleanup only on unmount
        return () => {
            if (urlRef.current) {
                URL.revokeObjectURL(urlRef.current);
            }
        };
    }, [file]);

    const analyzeVideo = async () => {
        setIsAnalyzing(true);
        setProgress(0);

        // Fake progress animation
        const interval = setInterval(() => {
            setProgress(prev => Math.min(prev + 1, 90));
        }, 100);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:8000/predict', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            clearInterval(interval);
            setProgress(100);
            setResult(response.data);
            console.log('Result:', response.data);
        } catch (error) {
            console.error('Error analyzing video:', error);
            alert('Analysis failed. Check console for details.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
            {/* Video Player Section */}
            <div className="lg:col-span-2 space-y-4">
                <div className="relative rounded-2xl overflow-hidden glass-panel border border-slate-700 bg-black/50 aspect-video group">
                    {videoUrl && (
                        <video
                            src={videoUrl}
                            controls
                            className="w-full h-full object-contain"
                            autoPlay
                            loop
                            muted
                        />
                    )}

                    {/* Scanning Overlay Animation */}
                    {isAnalyzing && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-scan" />
                            <div className="absolute inset-0 bg-red-500/5" />
                        </div>
                    )}
                </div>

                {/* Timeline / Waveform Placeholder */}
                <div className="glass-panel p-4 h-24 flex items-center justify-center gap-1">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <motion.div
                            key={i}
                            className={`w-1 rounded-full ${result?.is_violent ? 'bg-red-500/50' : 'bg-blue-500/30'}`}
                            initial={{ height: '20%' }}
                            animate={{ height: isAnalyzing ? ['20%', '80%', '20%'] : '40%' }}
                            transition={{ duration: 1, repeat: Infinity, delay: i * 0.05 }}
                        />
                    ))}
                </div>
            </div>

            {/* Analysis Results Panel */}
            <div className="lg:col-span-1 space-y-6">
                <div className={`glass-panel p-6 h-full flex flex-col transition-colors duration-500 ${result?.is_violent ? 'border-red-500/50 bg-red-950/20' : ''}`}>

                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-400" />
                        Live Analysis
                    </h2>

                    {!result ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full border-4 border-slate-700 border-t-blue-500 animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center text-xl font-mono font-bold text-white">
                                    {Math.round(progress)}%
                                </div>
                            </div>
                            <p className="animate-pulse">Processing Neural Network...</p>
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex-1 space-y-8"
                        >
                            {/* Verdict */}
                            <div className="text-center space-y-2">
                                <div className={`inline-flex items-center justify-center p-4 rounded-full mb-2 ${result.is_violent ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                    {result.is_violent ? <AlertOctagon size={48} /> : <CheckCircle size={48} />}
                                </div>
                                <h3 className="text-3xl font-bold text-white tracking-wide">
                                    {result.is_violent ? 'VIOLENCE DETECTED' : 'SAFE FOOTAGE'}
                                </h3>
                                <p className="text-slate-400 font-mono text-sm">
                                    {result.filename}
                                </p>
                            </div>

                            {/* Metrics */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Confidence Score</span>
                                        <span className="text-white font-mono">{(result.confidence * 100).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${result.confidence * 100}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className={`h-full ${result.is_violent ? 'bg-red-500' : 'bg-green-500'}`}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                                    <div className="flex items-center gap-2 text-sm text-slate-400">
                                        <Clock size={16} />
                                        Processing Time
                                    </div>
                                    <span className="font-mono text-blue-400">{result.processing_time_ms.toFixed(0)}ms</span>
                                </div>
                            </div>

                            {/* Alert Box if violent */}
                            {result.is_violent && (
                                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                                    <strong>Warning:</strong> High probability of physical altercation detected. Review footage immediately.
                                </div>
                            )}

                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
