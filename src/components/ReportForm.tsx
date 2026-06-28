/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { SAMPLE_CAMERA_PRESETS, analyzeIssueAI, createIssue } from "../api";
import { LocationInfo, IssueSeverity } from "../types";
import {
  Camera,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Image,
  UserCheck
} from "lucide-react";

interface ReportFormProps {
  userId: string;
  onSubmissionSuccess: () => void;
  onCancel: () => void;
}

const WARD_OPTIONS = [
  "Ward 4: Downtown Central",
  "Ward 7: Lakeside Promenade",
  "Ward 9: Green Hills Residential",
  "Ward 2: Industrial Corridor"
];

const CATEGORY_OPTIONS = ["Pothole", "Water Leakage", "Streetlight", "Waste", "Traffic", "Other"];

export function ReportForm({ userId, onSubmissionSuccess, onCancel }: ReportFormProps) {
  const [step, setStep] = useState<number>(1);
  const [description, setDescription] = useState<string>("");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [customImageBase64, setCustomImageBase64] = useState<string>("");
  const [customImageMime, setCustomImageMime] = useState<string>("");

  // AI Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiSuggestions, setAiSuggestions] = useState<any | null>(null);
  const [aiAnalysisError, setAiAnalysisError] = useState<string>("");

  // Final Form Fields
  const [title, setTitle] = useState<string>("");
  const [categoryUser, setCategoryUser] = useState<string>("Pothole");
  const [severity, setSeverity] = useState<IssueSeverity>("Medium");
  const [selectedWard, setSelectedWard] = useState<string>(WARD_OPTIONS[0]);
  const [address, setAddress] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>("");

  // Handle local image file uploads
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Image is too large. Please upload an image smaller than 10MB.");
      return;
    }

    setSelectedPresetId(""); // clear preset if uploading custom
    setCustomImageMime(file.type);

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      setCustomImageBase64(base64String);
    };
    reader.onerror = () => {
      alert("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  // Run AI Analysis
  const runAICopilot = async () => {
    if (!description && !selectedPresetId && !customImageBase64) {
      setAiAnalysisError("Please provide an issue description or select an image to analyze.");
      return;
    }

    setIsAnalyzing(true);
    setAiAnalysisError("");
    setAiSuggestions(null);

    try {
      let imgBase = "";
      let mime = "";

      if (customImageBase64) {
        imgBase = customImageBase64;
        mime = customImageMime;
      } else if (selectedPresetId) {
        // Since preset URLs are remote unsplash links, the server's AI fallback will handle category based on prompt,
        // or we can simulate downloading standard base64 or pass the description to represent.
        // For standard demo safety, we tell the backend about our preset type
        const preset = SAMPLE_CAMERA_PRESETS.find(p => p.id === selectedPresetId);
        if (preset) {
          // Send a descriptive trigger
          imgBase = ""; // Express can analyze by keywords
        }
      }

      // Prepare context description
      const presetRef = SAMPLE_CAMERA_PRESETS.find(p => p.id === selectedPresetId);
      const compositeDescription = description || (presetRef ? `${presetRef.description}` : "");

      const results = await analyzeIssueAI(compositeDescription, imgBase, mime);

      setAiSuggestions(results);

      // Autofill fields with high confidence
      setTitle(results.titleSuggestion || "");
      setCategoryUser(results.category || "Pothole");
      setSeverity(results.severity || "Medium");
      if (results.landmark) setLandmark(results.landmark);

      // Move to step 2
      setStep(2);
    } catch (err: any) {
      console.error(err);
      setAiAnalysisError("Google AI model was unable to parse. Please input fields manually.");
      // Move to manual input step anyway
      setStep(2);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit Final Report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !address) {
      setSubmitError("Please fill out all required fields: Title, Description, and Address.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      // Coordinate generation based on selected ward for map simulation
      let lat = 37.7749;
      let lng = -122.4194;

      if (selectedWard.includes("Lakeside")) {
        lat = 37.7801 + (Math.random() - 0.5) * 0.005;
        lng = -122.4250 + (Math.random() - 0.5) * 0.005;
      } else if (selectedWard.includes("Green Hills")) {
        lat = 37.7650 + (Math.random() - 0.5) * 0.005;
        lng = -122.4320 + (Math.random() - 0.5) * 0.005;
      } else if (selectedWard.includes("Industrial")) {
        lat = 37.7610 + (Math.random() - 0.5) * 0.005;
        lng = -122.4150 + (Math.random() - 0.5) * 0.005;
      } else { // Downtown Central
        lat = 37.7749 + (Math.random() - 0.5) * 0.005;
        lng = -122.4194 + (Math.random() - 0.5) * 0.005;
      }

      const location: LocationInfo = {
        coordinates: [lng, lat],
        address,
        ward: selectedWard,
        landmark: landmark || undefined
      };

      // Get image URL
      let imageUrl = "https://images.unsplash.com/photo-1584467541268-b040f83be3fd?auto=format&fit=crop&w=600&q=80"; // fallback default
      if (customImageBase64) {
        imageUrl = `data:${customImageMime};base64,${customImageBase64}`;
      } else if (selectedPresetId) {
        const preset = SAMPLE_CAMERA_PRESETS.find(p => p.id === selectedPresetId);
        if (preset) imageUrl = preset.url;
      }

      await createIssue({
        reporterId: isAnonymous ? "anonymous" : userId,
        title,
        description,
        categoryUser,
        categoryAI: aiSuggestions?.category,
        categoryConfidence: aiSuggestions?.confidence,
        severity,
        location,
        imageUrl,
        analysisData: aiSuggestions ? {
          labels: aiSuggestions.labels,
          confidence: aiSuggestions.confidence,
          severityScore: aiSuggestions.severityScore,
          detectedIssueType: aiSuggestions.category,
          damageEstimation: aiSuggestions.damageExplanation
        } : undefined
      });

      onSubmissionSuccess();
    } catch (err: any) {
      setSubmitError(err.message || "An error occurred while submitting your issue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedPreset = SAMPLE_CAMERA_PRESETS.find(p => p.id === selectedPresetId);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 max-w-2xl mx-auto">
      {/* Visual Step Indicator */}
      <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h2 className="font-display font-bold text-slate-900 text-lg">Report Community Problem</h2>
          <p className="text-slate-500 text-xs">Empower repair crews with localized AI-assisted diagnostics.</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono font-medium text-slate-400">
          <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 1 ? "bg-sky-50 text-sky-600 border-sky-300 font-bold" : "bg-slate-100 border-slate-200"}`}>1</span>
          <ChevronRight size={14} />
          <span className={`w-6 h-6 rounded-full flex items-center justify-center border ${step === 2 ? "bg-sky-50 text-sky-600 border-sky-300 font-bold" : "bg-slate-100 border-slate-200"}`}>2</span>
        </div>
      </div>

      {step === 1 ? (
        /* STEP 1: CAPTURE AND INTRODUCE */
        <div className="space-y-6">
          {/* Preset Camera Simulation / Gallery Selector */}
          <div>
            <label className="block text-slate-700 text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Camera size={14} className="text-slate-400" />
              Capture Issue Media (Choose Preset Camera or Upload File)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
              {SAMPLE_CAMERA_PRESETS.map((p) => (
                <button
                  id={`preset-img-btn-${p.id}`}
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPresetId(p.id);
                    setCustomImageBase64("");
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 text-left group transition-all ${
                    selectedPresetId === p.id
                      ? "border-sky-500 ring-2 ring-sky-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img
                    referrerPolicy="no-referrer"
                    src={p.url}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex p-1.5 items-end">
                    <span className="text-[9px] font-medium text-white leading-tight truncate">{p.name.split(" (")[0]}</span>
                  </div>
                </button>
              ))}

              {/* Upload manual uploader */}
              <label className="relative aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-sky-500 bg-slate-50 hover:bg-sky-50/20 flex flex-col items-center justify-center cursor-pointer transition-all group">
                <input
                  id="custom-file-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <Image className="text-slate-400 group-hover:text-sky-600 mb-1" size={18} />
                <span className="text-[9px] font-semibold text-slate-500 group-hover:text-sky-700">Upload Photo</span>
                {customImageBase64 && (
                  <div className="absolute inset-0 rounded-lg overflow-hidden p-0.5 bg-white">
                    <img
                      src={`data:${customImageMime};base64,${customImageBase64}`}
                      alt="Custom preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="issue-description-input" className="block text-slate-700 text-xs font-semibold mb-2">
              Provide Problem Details (Minimum 20 characters)
            </label>
            <textarea
              id="issue-description-input"
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell municipal workers and neighbors exactly what's wrong. E.g., 'There is a major water leak causing severe pavement sinkhole cracks near the elementary school crossing...'"
              className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all placeholder:text-slate-400"
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-[10px] text-slate-400 font-mono">
                {description.length} characters (Recommended: 50+)
              </span>
              {description.length > 0 && description.length < 20 && (
                <span className="text-rose-500 text-[10px] flex items-center gap-1">
                  <AlertCircle size={10} /> Need {20 - description.length} more characters
                </span>
              )}
            </div>
          </div>

          {/* Error */}
          {aiAnalysisError && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              <span>{aiAnalysisError}</span>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors"
            >
              Cancel
            </button>

            <button
              id="ai-copilot-analyze-btn"
              type="button"
              disabled={isAnalyzing || (description.length < 20 && !selectedPresetId && !customImageBase64)}
              onClick={runAICopilot}
              className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Analyzing Media with Vision AI...
                </>
              ) : (
                <>
                  <Sparkles size={14} className="text-amber-400 animate-pulse" />
                  Analyze with Gemini AI Co-Pilot →
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* STEP 2: CATEGORY CONFIRMATION & LOCATION PINNING */
        <form onSubmit={handleSubmitReport} className="space-y-6">
          {/* AI Feedback Callout */}
          {aiSuggestions && (
            <div className="p-4 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl flex gap-3">
              <Sparkles className="text-sky-600 shrink-0 mt-0.5 animate-pulse" size={20} />
              <div className="text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                  AI Grounding Diagnosis Completed
                  <span className="bg-sky-100 text-sky-800 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                    {aiSuggestions.confidence}% Confidence
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed italic">
                  &ldquo;{aiSuggestions.damageExplanation}&rdquo;
                </p>
                <div className="flex flex-wrap gap-1 pt-1.5">
                  {aiSuggestions.labels?.map((label: string) => (
                    <span key={label} className="bg-white/80 border border-sky-100 rounded px-1.5 py-0.5 text-[9px] font-mono text-slate-500">
                      #{label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Title suggestion */}
          <div>
            <label htmlFor="issue-title-input" className="block text-slate-700 text-xs font-semibold mb-1.5">
              Issue Report Title (AI Suggested)
            </label>
            <input
              id="issue-title-input"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Provide a short descriptive title..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition-all font-semibold text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Select */}
            <div>
              <label htmlFor="category-select" className="block text-slate-700 text-xs font-semibold mb-1.5">
                Issue Category
              </label>
              <select
                id="category-select"
                value={categoryUser}
                onChange={(e) => setCategoryUser(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-sky-500 outline-none transition-all font-medium text-slate-800"
              >
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            {/* Severity Select */}
            <div>
              <label htmlFor="severity-select" className="block text-slate-700 text-xs font-semibold mb-1.5">
                Diagnosed Severity Level
              </label>
              <select
                id="severity-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as IssueSeverity)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-sky-500 outline-none transition-all font-semibold text-slate-800"
              >
                <option value="Low">🔵 Low (Minor inconvenience)</option>
                <option value="Medium">🟡 Medium (Requires attention)</option>
                <option value="High">🟠 High (Significant disruption)</option>
                <option value="Critical">🔴 Critical (Immediate public danger)</option>
              </select>
            </div>
          </div>

          {/* Location details */}
          <div className="space-y-4 border-t border-slate-100 pt-4">
            <h3 className="font-display font-semibold text-slate-800 text-xs flex items-center gap-1.5">
              <MapPin size={14} className="text-sky-600" />
              Geo-Location Verification
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ward Select */}
              <div>
                <label htmlFor="ward-select" className="block text-slate-700 text-xs font-semibold mb-1.5">
                  Select Municipal Ward
                </label>
                <select
                  id="ward-select"
                  value={selectedWard}
                  onChange={(e) => {
                    setSelectedWard(e.target.value);
                    // auto generate placeholder address based on ward
                    if (!address) {
                      const wardName = e.target.value.split(": ")[1];
                      setAddress(`100 public road, ${wardName}`);
                    }
                  }}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-sky-500 outline-none transition-all text-slate-800"
                >
                  {WARD_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              {/* Landmark */}
              <div>
                <label htmlFor="landmark-input" className="block text-slate-700 text-xs font-semibold mb-1.5">
                  Local Landmark / Building (Optional)
                </label>
                <input
                  id="landmark-input"
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="E.g. St. Jude School Crossing, Central Park entrance"
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-sky-500 outline-none transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address-input" className="block text-slate-700 text-xs font-semibold mb-1.5">
                Exact Street Address / Crossroad (Required)
              </label>
              <input
                id="address-input"
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Type street name and nearest block. E.g., 415 Maple Avenue"
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-sky-500 outline-none transition-all text-slate-800"
              />
            </div>
          </div>

          {/* Privacy Layer */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <input
              id="anonymous-checkbox"
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
            />
            <label htmlFor="anonymous-checkbox" className="text-slate-600 text-xs select-none flex items-center gap-1.5">
              <UserCheck size={14} className="text-slate-400" />
              Submit anonymously (Your identity remains hidden from the public database)
            </label>
          </div>

          {submitError && (
            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 text-xs flex items-center gap-2 animate-bounce">
              <AlertCircle size={14} />
              <span>{submitError}</span>
            </div>
          )}

          {/* Form navigation */}
          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl border border-slate-200 transition-colors flex items-center gap-1"
            >
              <ChevronLeft size={14} /> Modify Media
            </button>

            <button
              id="submit-issue-report-btn"
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white font-semibold text-xs px-6 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Filing Report...
                </>
              ) : (
                <>
                  <CheckCircle2 size={14} />
                  File Official Report (+25 Karma)
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
