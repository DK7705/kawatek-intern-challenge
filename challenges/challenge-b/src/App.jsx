import { useState, useEffect, useCallback } from 'react';
import { usePatientData } from './hooks/usePatientData';
import { useTheme } from './hooks/useTheme';
import { useSimulation } from './hooks/useSimulation';
import { generateRecommendations } from './ml/recommendationEngine';
import Header from './components/Header';
import SummaryCards from './components/SummaryCards';
import ProgressChart from './components/ProgressChart';
import ExerciseChart from './components/ExerciseChart';
import FatigueChart from './components/FatigueChart';
import Recommendations from './components/Recommendations';
import SessionList from './components/SessionList';
import SessionCompare from './components/SessionCompare';
import LoadingState from './components/LoadingState';
import ErrorState from './components/ErrorState';

export default function App() {
  const { data, loading, error, retry } = usePatientData();
  const { isDark, toggle } = useTheme();
  const simulation = useSimulation(data?.sessions);

  const [recommendations, setRecommendations] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedCompareIds, setSelectedCompareIds] = useState([]);

  useEffect(() => {
    if (data?.sessions) {
      const results = generateRecommendations(data.sessions);
      setRecommendations(results);
    }
  }, [data]);

  const allSessions =
    data?.sessions && simulation.simulatedSession?.exercises?.length
      ? [...data.sessions, simulation.simulatedSession]
      : data?.sessions ?? [];

  const handleCompareSelect = useCallback((sessionId) => {
    setSelectedCompareIds((prev) => {
      if (prev.includes(sessionId)) {
        return prev.filter((id) => id !== sessionId);
      }
      const next = [...prev, sessionId];
      if (next.length === 2) {
        setCompareOpen(true);
      }
      return next.slice(-2);
    });
  }, []);

  const handlePrint = useCallback(() => window.print(), []);

  const handleCompare = useCallback(() => {
    setCompareOpen(true);
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={retry} />;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <Header
        patient={data.patient}
        isDark={isDark}
        onToggleTheme={toggle}
        simulation={simulation}
        onPrint={handlePrint}
        onCompare={handleCompare}
        selectedCompareIds={selectedCompareIds}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 print:grid print:grid-cols-2 print:gap-4 print:space-y-0">
        {/* Print-only clinical hospital report header */}
        <div className="hidden print:block print:col-span-2 border border-slate-300 p-4 mb-2 bg-slate-50">
          <div className="flex justify-between items-center border-b border-slate-300 pb-2 mb-3">
            <div>
              <h1 className="text-xl font-bold font-display text-slate-900 tracking-tight">
                ACTIVAI® REHABILITATION PROGRESS RECORD
              </h1>
              <p className="text-[9px] text-slate-500 font-mono mt-0.5 uppercase tracking-wider">
                KAWATEK MEDICAL SYSTEMS — CLINICAL EVALUATION DIVISION
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs bg-slate-900 text-white font-mono px-2.5 py-1 font-bold rounded uppercase tracking-widest">
                CONFIDENTIAL
              </span>
            </div>
          </div>
          <table className="w-full text-[10px] font-mono border-collapse">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="py-1 px-2 border-r border-slate-200 w-1/3"><strong>PATIENT NAME:</strong> {data.patient.name}</td>
                <td className="py-1 px-2 border-r border-slate-200 w-1/3"><strong>PATIENT ID:</strong> {data.patient.id}</td>
                <td className="py-1 px-2 w-1/3"><strong>AGE / GENDER:</strong> {data.patient.age} / M</td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="py-1 px-2 border-r border-slate-200"><strong>PROSTHETIC DEVICE:</strong> {data.patient.device}</td>
                <td className="py-1 px-2 border-r border-slate-200"><strong>LEAD CLINICIAN:</strong> {data.patient.therapist}</td>
                <td className="py-1 px-2"><strong>FACILITY:</strong> Kawatek Clinic</td>
              </tr>
              <tr>
                <td className="py-1 px-2 border-r border-slate-200"><strong>THERAPY STARTED:</strong> {data.patient.start_date}</td>
                <td className="py-1 px-2 border-r border-slate-200"><strong>REPORT GENERATED:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                <td className="py-1 px-2"><strong>RECORD STATUS:</strong> ACTIVE (10 SESSIONS)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="print:col-span-2">
          <SummaryCards sessions={allSessions} />
        </div>

        <div className="print:col-span-1">
          <ProgressChart sessions={allSessions} isDark={isDark} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:contents">
          <div className="print:hidden">
            <ExerciseChart sessions={allSessions} isDark={isDark} />
          </div>
          <div className="print:col-span-1">
            <Recommendations recommendations={recommendations} />
          </div>
        </div>

        <div className="print:col-span-1">
          <FatigueChart sessions={allSessions} isDark={isDark} />
        </div>

        <div className="print:col-span-1">
          <SessionList
            sessions={allSessions}
            onCompareSelect={handleCompareSelect}
            selectedCompareIds={selectedCompareIds}
          />
        </div>
      </main>
      {compareOpen && (
        <SessionCompare
          sessions={allSessions}
          selectedIds={selectedCompareIds}
          isOpen={compareOpen}
          onClose={() => setCompareOpen(false)}
        />
      )}
    </div>
  );
}

