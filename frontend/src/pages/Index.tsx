import { useState } from "react";
import { AuraNavbar } from "@/components/AuraNavbar";
import { AuraHero } from "@/components/AuraHero";
import { PulseSection } from "@/components/PulseSection";
import { TransformationSection } from "@/components/TransformationSection";
import { SymbiosisSection } from "@/components/SymbiosisSection";
import { FinalCTA } from "@/components/FinalCTA";
import { AuraFooter } from "@/components/AuraFooter";
import { CaptureScreen, AnalysisResult } from "@/components/CaptureScreen";
import { AIAnalysisResult } from "@/components/AIAnalysisResult";
import { ConfirmationScreen } from "@/components/ConfirmationScreen";
import { ReportTracking } from "@/components/ReportTracking";
import { AdminDashboard } from "@/components/AdminDashboard";
import { IssuesMap } from "@/components/IssuesMap";

type Screen = "home" | "capture" | "analysis" | "confirmation" | "tracking" | "admin" | "map";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("home");
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);

  const handleStartReport = () => setCurrentScreen("capture");

  const handleCapture = (data: AnalysisResult) => {
    setAnalysisData(data);
    setCurrentScreen("analysis");
  };

  const handleSubmit = () => setCurrentScreen("confirmation");
  const handleGoHome = () => {
    setCurrentScreen("home");
    setAnalysisData(null);
  };
  const handleTrackReports = () => setCurrentScreen("tracking");
  const handleAdminDashboard = () => setCurrentScreen("admin");
  const handleMapView = () => setCurrentScreen("map");

  // Render overlay screens
  if (currentScreen === "capture") {
    return <CaptureScreen onCapture={handleCapture} onClose={handleGoHome} />;
  }

  if (currentScreen === "analysis" && analysisData) {
    return (
      <AIAnalysisResult
        analysisData={analysisData}
        onSubmit={handleSubmit}
        onBack={() => setCurrentScreen("capture")}
      />
    );
  }

  if (currentScreen === "confirmation") {
    return <ConfirmationScreen onGoHome={handleGoHome} onTrackReport={handleTrackReports} />;
  }

  if (currentScreen === "tracking") {
    return <ReportTracking onBack={handleGoHome} />;
  }

  if (currentScreen === "admin") {
    return <AdminDashboard onBack={handleGoHome} />;
  }

  if (currentScreen === "map") {
    return <IssuesMap onBack={handleGoHome} />;
  }

  // Main landing page - Aura design

  // Quick Backend Health Check UI
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");

  // Use simple effect to check backend
  useState(() => {
    import("@/services/api").then(({ checkBackendHealth }) => {
      checkBackendHealth().then(res => {
        setBackendStatus(res ? "Online ✅" : "Offline ❌");
      });
    });
  });

  return (
    <div className="min-h-screen bg-background relative">
      <div className="absolute top-0 right-0 p-2 text-xs text-white/50 z-50 pointer-events-none">
        Backend: {backendStatus}
      </div>
      <AuraNavbar
        onTrackReports={handleTrackReports}
        onAdminDashboard={handleAdminDashboard}
        onMapView={handleMapView}
        onStartReport={handleStartReport}
      />
      <main>
        <AuraHero onStartReport={handleStartReport} />
        <section id="pulse">
          <PulseSection />
        </section>
        <TransformationSection />
        <section id="impact">
          <SymbiosisSection />
        </section>
        <FinalCTA onStartReport={handleStartReport} />
      </main>
      <AuraFooter />
    </div>
  );
};

export default Index;
