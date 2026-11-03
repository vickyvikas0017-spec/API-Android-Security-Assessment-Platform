import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';
import { HttpTesterModal } from './components/HttpTesterModal';
import { Dashboard } from './pages/Dashboard';
import { ProjectOverview } from './pages/ProjectOverview';
import { ApiRecon } from './pages/ApiRecon';
import { ApiVulns } from './pages/ApiVulns';
import { CrapiInvestigation } from './pages/CrapiInvestigation';
import { BolaTesting } from './pages/BolaTesting';
import { AuthTesting } from './pages/AuthTesting';
import { OtpSecurity } from './pages/OtpSecurity';
import { ApkAnalysis } from './pages/ApkAnalysis';
import { ApkLeakInvestigation } from './pages/ApkLeakInvestigation';
import { IntegratedAssessment } from './pages/IntegratedAssessment';
import { EvidenceManager } from './pages/EvidenceManager';
import { VulnerabilityReports } from './pages/VulnerabilityReports';
import { FinalReport } from './pages/FinalReport';
import { Settings } from './pages/Settings';
import { api } from './services/api';
import { ApiEndpoint } from './types';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [httpTesterOpen, setHttpTesterOpen] = useState(false);
  const [testerUrl, setTesterUrl] = useState('http://localhost:8888/identity/api/v2/user/dashboard');
  const [testerMethod, setTesterMethod] = useState('GET');
  const [counts, setCounts] = useState<{ endpoints?: number; vulns?: number; evidence?: number }>({});

  useEffect(() => {
    loadGlobalCounts();
  }, [currentPage]);

  const loadGlobalCounts = async () => {
    try {
      const stats = await api.getDashboardStats();
      setCounts({
        endpoints: stats.total_endpoints,
        vulns: stats.total_vulnerabilities,
        evidence: stats.total_evidence
      });
    } catch (e) {
      // Ignore initial silent fail
    }
  };

  const handleTestEndpoint = (endpoint: ApiEndpoint) => {
    const fullUrl = endpoint.path.startsWith('http')
      ? endpoint.path
      : `http://localhost:8888${endpoint.path}`;
    setTesterUrl(fullUrl);
    setTesterMethod(endpoint.method);
    setHttpTesterOpen(true);
  };

  const handleSaveEvidenceFromTester = async (reqSnippet: string, respSnippet: string, endpoint: string) => {
    try {
      const formData = new FormData();
      formData.append('title', `Live Test Artifact: ${endpoint}`);
      formData.append('related_question', 'Q2');
      formData.append('vulnerability_category', 'Live HTTP Probe');
      formData.append('description', `Executed live HTTP request against ${endpoint}`);
      formData.append('related_endpoint', endpoint);
      formData.append('redacted_content', `${reqSnippet}\n\n${respSnippet}`);
      await api.uploadEvidence(formData);
      loadGlobalCounts();
    } catch (err: any) {
      console.error('Failed to save evidence from tester:', err);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans antialiased">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        targetUrl="http://localhost:8888"
        onOpenReport={() => setCurrentPage('final-report')}
      />

      <div className="flex-1 flex bg-white">
        {/* Pinned / Collapsible Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onSelectPage={(page) => setCurrentPage(page)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          counts={counts}
        />

        {/* Main Content Area */}
        <main className="flex-1 bg-white p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {currentPage === 'dashboard' && (
            <Dashboard
              onNavigate={(page) => setCurrentPage(page)}
              onOpenHttpTester={() => setHttpTesterOpen(true)}
            />
          )}
          {currentPage === 'project-overview' && <ProjectOverview />}
          {currentPage === 'api-recon' && <ApiRecon onTestEndpoint={handleTestEndpoint} />}
          {currentPage === 'api-vulns' && <ApiVulns />}
          {currentPage === 'crapi' && <CrapiInvestigation />}
          {currentPage === 'bola' && <BolaTesting />}
          {currentPage === 'auth-matrix' && <AuthTesting />}
          {currentPage === 'otp-security' && <OtpSecurity />}
          {currentPage === 'apk-analysis' && <ApkAnalysis />}
          {currentPage === 'apk-leak' && <ApkLeakInvestigation />}
          {currentPage === 'integrated' && <IntegratedAssessment />}
          {currentPage === 'evidence' && <EvidenceManager />}
          {currentPage === 'vuln-reports' && <VulnerabilityReports />}
          {currentPage === 'final-report' && <FinalReport />}
          {currentPage === 'settings' && <Settings />}
        </main>
      </div>

      {/* Global Interactive HTTP Tester Console */}
      <HttpTesterModal
        isOpen={httpTesterOpen}
        onClose={() => setHttpTesterOpen(false)}
        initialUrl={testerUrl}
        initialMethod={testerMethod}
        onSaveEvidence={handleSaveEvidenceFromTester}
      />
    </div>
  );
};
export default App;

