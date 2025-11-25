"use client";

import * as React from "react";
import { Upload, Camera, FileImage, Loader2, AlertTriangle, Clock, Wrench, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CameraCapture, useCameraAvailable } from "@/components/camera-capture";

type AnalysisState = "idle" | "uploading" | "analyzing" | "complete";

interface AnalysisResult {
  object: {
    name: string;
    category: string;
    confidence: number;
  };
  issue: {
    name: string;
    description: string;
    riskScore: number;
    difficulty: string;
  };
  timeEstimate: string;
  tools: string[];
  steps: Array<{
    step: number;
    action: string;
    description?: string;
    time: string;
    icon: string;
  }>;
  safetyWarnings: string[];
}

export default function DashboardPage() {
  const [state, setState] = React.useState<AnalysisState>("idle");
  const [dragOver, setDragOver] = React.useState(false);
  const [preview, setPreview] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [showCamera, setShowCamera] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraAvailable = useCameraAvailable();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  // Handle camera capture
  const handleCameraCapture = async (imageData: string) => {
    setShowCamera(false);
    setPreview(imageData);
    await analyzeImage(imageData);
  };

  // Analyze image (from file or camera)
  const analyzeImage = async (imageData: string) => {
    setState("uploading");
    await new Promise((r) => setTimeout(r, 500));
    setState("analyzing");

    // Call the API
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Map API response to component format
        const apiResult = data.data;
        setResult({
          object: {
            name: apiResult.detection?.object?.name || "Neznámý objekt",
            category: apiResult.detection?.object?.category || "other",
            confidence: apiResult.confidence || 0.8,
          },
          issue: {
            name: apiResult.detection?.issue?.name || "Neznámá závada",
            description: apiResult.detection?.issue?.description || "",
            riskScore: apiResult.detection?.issue?.riskScore || 5,
            difficulty: getDifficultyLabel(apiResult.detection?.issue?.difficulty || "MEDIUM"),
          },
          timeEstimate: apiResult.recommendations?.timeEstimate || "15 min",
          tools: apiResult.recommendations?.tools || [],
          steps: apiResult.recommendations?.steps || [],
          safetyWarnings: apiResult.recommendations?.safetyWarnings || [],
        });
      } else {
        throw new Error(data.error || "Analýza selhala");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      // Fallback to mock data on error
      setResult(getMockResult());
    }

    setState("complete");
  };

  const getDifficultyLabel = (difficulty: string): string => {
    const labels: Record<string, string> = {
      "VERY_EASY": "Velmi snadná",
      "EASY": "Snadná",
      "MEDIUM": "Střední",
      "HARD": "Těžká",
      "VERY_HARD": "Velmi těžká",
      "EXPERT": "Pro experty",
    };
    return labels[difficulty] || difficulty;
  };

  const getMockResult = (): AnalysisResult => ({
    object: { name: "Kohoutek", category: "voda", confidence: 0.92 },
    issue: {
      name: "Kapající kohoutek",
      description: "Netěsnící těsnění nebo O-kroužek způsobuje únik vody.",
      riskScore: 2,
      difficulty: "Nízká",
    },
    timeEstimate: "15 min",
    tools: ["Klíč", "Šroubovák", "Nové těsnění", "Hadřík"],
    steps: [
      { step: 1, action: "Zavřete hlavní přívod vody", time: "1 min", icon: "🚰" },
      { step: 2, action: "Otevřete kohoutek pro uvolnění tlaku", time: "30 s", icon: "💧" },
      { step: 3, action: "Odšroubujte hlavici kohoutku", time: "2 min", icon: "🔧" },
      { step: 4, action: "Vyjměte staré těsnění", time: "2 min", icon: "⚙️" },
      { step: 5, action: "Nasaďte nové těsnění", time: "2 min", icon: "🔩" },
      { step: 6, action: "Sestavte kohoutek zpět", time: "3 min", icon: "🔧" },
      { step: 7, action: "Pusťte vodu a zkontrolujte", time: "2 min", icon: "✅" },
    ],
    safetyWarnings: [
      "Vždy nejdříve zavřete hlavní přívod vody",
      "Mějte připravený kbelík na zachycení zbylé vody",
      "Nepoužívejte nadměrnou sílu při utahování",
    ],
  });

  const handleFile = async (file: File) => {
    // Create preview and analyze
    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setPreview(imageData);
      await analyzeImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const resetAnalysis = () => {
    setState("idle");
    setPreview(null);
    setResult(null);
    setCurrentStep(0);
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return "success";
    if (score <= 6) return "warning";
    return "danger";
  };

  return (
    <div className="container py-8">
      {/* Idle State - Upload Zone */}
      {state === "idle" && (
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white mb-6 shadow-lg shadow-indigo-500/25">
              <Camera className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Vyfotografujte závadu
            </h1>
            <p className="text-muted-foreground text-lg">
              AI okamžitě identifikuje problém a nabídne řešení
            </p>
          </div>

          <div
            className={cn(
              "relative group border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer bg-gradient-to-b from-slate-50 to-white",
              dragOver
                ? "border-indigo-500 bg-indigo-50/50 scale-[1.02]"
                : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            {/* Decorative corner elements */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-indigo-200 rounded-tl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-indigo-200 rounded-tr-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-indigo-200 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-indigo-200 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity" />

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-teal-100 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Upload className="h-10 w-10 text-indigo-600" />
            </div>
            <p className="text-xl font-semibold text-slate-800 mb-2">Přetáhněte fotografii sem</p>
            <p className="text-muted-foreground">
              nebo klikněte pro výběr souboru
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-sm text-muted-foreground">
              <FileImage className="h-4 w-4" />
              JPG, PNG, GIF, WebP
            </div>
          </div>

          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="outline"
              size="lg"
              className="border-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileImage className="mr-2 h-5 w-5 text-indigo-600" />
              Vybrat fotografii
            </Button>
            {cameraAvailable !== false && (
              <Button
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5"
                onClick={() => setShowCamera(true)}
              >
                <Camera className="mr-2 h-5 w-5" />
                Použít kameru
              </Button>
            )}
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-4 mt-14">
            <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-white">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-100 mb-3">
                  <Clock className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="font-semibold text-slate-800">30 sekund</div>
                <div className="text-xs text-muted-foreground">Průměrná analýza</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-teal-50 to-white">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-teal-100 mb-3">
                  <CheckCircle className="h-6 w-6 text-teal-600" />
                </div>
                <div className="font-semibold text-slate-800">Bezpečné</div>
                <div className="text-xs text-muted-foreground">S varováními</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-white">
              <CardContent className="pt-6 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-100 mb-3">
                  <Wrench className="h-6 w-6 text-amber-600" />
                </div>
                <div className="font-semibold text-slate-800">500+ oprav</div>
                <div className="text-xs text-muted-foreground">V databázi</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Analyzing State */}
      {(state === "uploading" || state === "analyzing") && (
        <div className="max-w-md mx-auto text-center py-16">
          <div className="relative inline-flex items-center justify-center mb-8">
            <div className="absolute w-24 h-24 rounded-full bg-indigo-100 animate-ping opacity-75" />
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Loader2 className="h-10 w-10 text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-6">
            {state === "uploading" ? "Nahrávám fotografii..." : "AI analyzuje..."}
          </h2>
          <div className="space-y-3 text-base">
            <div className={`flex items-center justify-center gap-3 ${state === "analyzing" ? "text-teal-600 font-medium" : "text-muted-foreground"}`}>
              <CheckCircle className={`h-5 w-5 ${state === "analyzing" ? "text-teal-500" : ""}`} />
              <span>Detekce objektu</span>
            </div>
            <div className={`flex items-center justify-center gap-3 ${state === "analyzing" ? "text-teal-600 font-medium" : "text-muted-foreground"}`}>
              <CheckCircle className={`h-5 w-5 ${state === "analyzing" ? "text-teal-500" : ""}`} />
              <span>Identifikace závady</span>
            </div>
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <div className="h-5 w-5 rounded-full border-2 border-slate-300" />
              <span>Příprava návodů</span>
            </div>
          </div>
        </div>
      )}

      {/* Results State */}
      {state === "complete" && result && (
        <div className="max-w-4xl mx-auto">
          {/* Result Header */}
          <Card className="mb-6 overflow-hidden border-0 shadow-xl">
            <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-800 text-white p-8">
              <div className="flex items-start gap-6">
                {preview && (
                  <img
                    src={preview}
                    alt="Analyzovaný obrázek"
                    className="w-28 h-28 object-cover rounded-xl shadow-lg ring-4 ring-white/20"
                  />
                )}
                <div className="flex-1">
                  <Badge className="mb-3 bg-teal-500/20 text-teal-200 border-teal-400/30">
                    Detekováno s {Math.round(result.object.confidence * 100)}% jistotou
                  </Badge>
                  <h2 className="text-3xl font-bold">{result.object.name}</h2>
                  <p className="text-indigo-200 mt-2 text-lg">{result.issue.name}</p>
                </div>
              </div>
            </div>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Čas opravy</div>
                  <div className="font-semibold">{result.timeEstimate}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Obtížnost</div>
                  <div className="font-semibold">{result.issue.difficulty}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Riziko</div>
                  <Badge variant={getRiskColor(result.issue.riskScore)}>
                    {result.issue.riskScore}/10
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Safety Warnings */}
          {result.safetyWarnings.length > 0 && (
            <Card className="mb-6 border-warning bg-warning-light">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-5 w-5" />
                  Bezpečnostní upozornění
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.safetyWarnings.map((warning, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-warning">⚠️</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tools */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Potřebné nástroje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {result.tools.map((tool) => (
                  <Badge key={tool} variant="outline">
                    {tool}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                Krok {currentStep + 1} z {result.steps.length}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-6xl mb-4">{result.steps[currentStep].icon}</div>
                <h3 className="text-xl font-semibold mb-2">
                  {result.steps[currentStep].action}
                </h3>
                <Badge variant="outline">{result.steps[currentStep].time}</Badge>
              </div>

              {/* Step navigation */}
              <div className="flex justify-between mt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                >
                  Předchozí krok
                </Button>
                {currentStep < result.steps.length - 1 ? (
                  <Button
                    className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white shadow-lg shadow-indigo-500/25"
                    onClick={() => setCurrentStep(currentStep + 1)}
                  >
                    Další krok
                  </Button>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white shadow-lg shadow-teal-500/25"
                    onClick={resetAnalysis}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Dokončit opravu
                  </Button>
                )}
              </div>

              {/* All steps overview */}
              <div className="mt-8 pt-6 border-t">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Přehled všech kroků</h4>
                <div className="space-y-2">
                  {result.steps.map((step, i) => (
                    <div
                      key={step.step}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                        i === currentStep && "bg-indigo-50 border-l-4 border-indigo-500 shadow-sm",
                        i < currentStep && "bg-teal-50 opacity-90",
                        i > currentStep && "bg-slate-50 hover:bg-slate-100"
                      )}
                      onClick={() => setCurrentStep(i)}
                    >
                      <span className="text-xl">{step.icon}</span>
                      <span className={cn("flex-1 text-sm", i === currentStep && "font-semibold text-indigo-700", i < currentStep && "text-teal-700")}>
                        {step.action}
                      </span>
                      <span className={cn("text-xs px-2 py-1 rounded-full", i === currentStep ? "bg-indigo-100 text-indigo-600" : "text-muted-foreground")}>{step.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={resetAnalysis}>
              Analyzovat další závadu
            </Button>
            <Button variant="secondary">
              Zavolat odborníka
            </Button>
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
