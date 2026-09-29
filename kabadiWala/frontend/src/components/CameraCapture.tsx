import React, { useState } from 'react';
import { Camera, Upload, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useI18n } from '../services/i18n';

interface CameraCaptureProps {
  onPhotoSelected: (photoUrl: string) => void;
  onCategoryPredicted?: (category: string) => void;
  selectedCategory?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  onPhotoSelected,
  onCategoryPredicted,
  selectedCategory,
}) => {
  const { t } = useI18n();
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<any | null>(null);

  const sampleImages = [
    { label: 'Printed Circuit Board (PCB)', file: 'pcb_sample.jpg', preview: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=60' },
    { label: 'Copper Cable Batch', file: 'cable_wire.jpg', preview: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=500&auto=format&fit=crop&q=60' },
    { label: 'Batteries Batch', file: 'battery_cells.jpg', preview: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=500&auto=format&fit=crop&q=60' },
    { label: 'Computer Screens / LCD', file: 'lcd_display.jpg', preview: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop&q=60' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onPhotoSelected(result);
        triggerAiAnalysis(file.name, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectSample = (sample: typeof sampleImages[0]) => {
    setPreview(sample.preview);
    onPhotoSelected(sample.preview);
    triggerAiAnalysis(sample.file, sample.preview);
  };

  const triggerAiAnalysis = async (filename: string, imageBase64?: string) => {
    setIsAnalyzing(true);
    setAiResult(null);
    try {
      const res = await api.classifyImage(filename, undefined, imageBase64);
      setAiResult(res);
      if (onCategoryPredicted && res.predictedCategory) {
        onCategoryPredicted(res.predictedCategory);
      }
    } catch (err) {
      console.error('AI classification failed', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload or Camera Area */}
      <div className="border-2 border-dashed border-emerald-300 bg-emerald-50/40 rounded-3xl p-6 text-center hover:bg-emerald-50/70 transition-colors flex flex-col items-center justify-center relative min-h-[220px]">
        {preview ? (
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-lg border border-slate-200">
            <img src={preview} alt="E-waste lot" className="w-full h-48 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-3 text-white">
              <span className="text-xs font-bold">Photo Captured</span>
              <label className="text-xs bg-white text-slate-800 font-bold px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-100 shadow">
                Retake
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-700/20 mb-3 animate-bounce-subtle">
              <Camera className="w-8 h-8" />
            </div>
            <h4 className="font-extrabold text-base text-slate-800 mb-1">{t('take_photo')}</h4>
            <p className="text-xs text-slate-500 max-w-xs mb-4">
              AI camera automatically identifies material category and assists weight estimation.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              <label className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-2 active:scale-95 transition-all">
                <Camera className="w-4 h-4" />
                <span>Use Device Camera</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              </label>
              <label className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm cursor-pointer flex items-center gap-2 active:scale-95 transition-all">
                <Upload className="w-4 h-4" />
                <span>Upload File</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Quick Sample Presets for Fast Hackathon Demo */}
      <div className="space-y-1.5">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Demo Test Photos (Quick Select):
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {sampleImages.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectSample(s)}
              className="p-2 text-left rounded-xl border border-slate-200 bg-white hover:border-emerald-500 hover:shadow-sm text-xs font-semibold text-slate-700 flex items-center gap-2 transition-all"
            >
              <img src={s.preview} alt={s.label} className="w-7 h-7 rounded-md object-cover" />
              <span className="truncate">{s.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Material Classification Result Card */}
      {isAnalyzing && (
        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 flex items-center gap-3 animate-pulse">
          <Sparkles className="w-5 h-5 text-indigo-600 animate-spin" />
          <div className="text-xs">
            <span className="font-extrabold block">AI Vision Model Analyzing...</span>
            <span className="text-indigo-600">Extracting visual features and estimating scrap grade</span>
          </div>
        </div>
      )}

      {aiResult && !isAnalyzing && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 text-slate-800 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                <Sparkles className="w-3 h-3" />
                MobileNetV3 Edge Vision
              </span>
              <span className="text-xs font-bold text-emerald-800">
                Confidence: {Math.round(aiResult.confidence * 100)}%
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
              ⚡ {aiResult.inferenceLatencyMs || 28}ms
            </span>
          </div>

          <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100 shadow-xs mb-2">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block">
                Classified Category & Grade
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-base font-black text-emerald-900">{aiResult.predictedCategory}</span>
                {aiResult.subCategoryHint && (
                  <span className="text-xs text-slate-600 font-medium">({aiResult.subCategoryHint})</span>
                )}
              </div>
            </div>
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          </div>

          {/* Detected Features */}
          {aiResult.detectedFeatures && aiResult.detectedFeatures.length > 0 && (
            <div className="text-xs mb-2 bg-white/70 p-2.5 rounded-lg border border-slate-100">
              <span className="text-[11px] text-slate-700 font-bold block mb-1">
                Visual Descriptors & Signatures:
              </span>
              <ul className="grid grid-cols-1 gap-1 text-[11px] text-slate-600">
                {aiResult.detectedFeatures.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Critical Minerals Badge if present */}
          {aiResult.criticalMinerals && aiResult.criticalMinerals.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1 text-[11px]">
              <span className="text-slate-500 font-semibold">Recoverable Minerals:</span>
              {aiResult.criticalMinerals.map((min: string, idx: number) => (
                <span key={idx} className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px]">
                  {min}
                </span>
              ))}
            </div>
          )}

          {/* Safety Recommendation */}
          <div className="text-xs p-2.5 rounded-lg bg-emerald-100/70 text-emerald-950 font-medium border border-emerald-200/50">
            💡 <strong>Handling Protocol:</strong> {aiResult.suggestedHandling}
          </div>
        </div>
      )}
    </div>
  );
};
