import React, { useState } from 'react';
import HeroSection from './components/HeroSection';
import AnalysisDashboard from './components/AnalysisDashboard';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

function App() {
  const [videoFile, setVideoFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (file) => {
    setVideoFile(file);
    setAnalysisResult(null); // Reset previous result
  };

  const resetApp = () => {
    setVideoFile(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden text-slate-200 selection:bg-red-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[120px]" />
      </div>

      <nav className="relative z-50 flex items-center justify-between px-8 py-5 border-b border-slate-800/50 glass-panel mt-4 mx-4">
        <div className="flex items-center gap-3 cursor-pointer" onClick={resetApp}>
          <div className="p-2 bg-gradient-to-br from-red-500 to-red-700 rounded-lg shadow-lg shadow-red-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-wider text-white">
            V-SECURE <span className="text-red-500 font-mono text-sm">AI</span>
          </span>
        </div>
        <div className="flex gap-4 text-sm font-medium text-slate-400">
          {videoFile && (
            <button onClick={resetApp} className="hover:text-white transition-colors">
              New Analysis
            </button>
          )}
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 py-8">
        {!videoFile ? (
          <HeroSection onFileSelect={handleFileSelect} />
        ) : (
          <AnalysisDashboard
            file={videoFile}
            result={analysisResult}
            setResult={setAnalysisResult}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        )}
      </main>

      <footer className="relative z-10 text-center py-6 text-slate-600 text-sm">
        <p>© 2026 V-Secure Systems using CNN-LSTM Architecture</p>
      </footer>
    </div>
  );
}

export default App;
