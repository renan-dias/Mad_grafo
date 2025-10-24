import React, { useState } from 'react';
import GraphExplanation from './components/GraphExplanation';
import TrendsExplorer from './components/TrendsExplorer';
import GraphActivity from './components/GraphActivity';

type Tab = 'explanation' | 'trends' | 'activity';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('explanation');

  const renderContent = () => {
    switch (activeTab) {
      case 'explanation':
        return <GraphExplanation />;
      case 'trends':
        return <TrendsExplorer />;
      case 'activity':
        return <GraphActivity />;
      default:
        return <GraphExplanation />;
    }
  };

  const TabButton = ({ tab, label }: { tab: Tab; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm md:text-base font-bold transition-all duration-300 border-b-2 ${
        activeTab === tab
          ? 'text-cyan-300 border-cyan-300 scale-105'
          : 'text-slate-400 border-transparent hover:text-cyan-300 hover:border-cyan-400'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px]">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8 border-b-2 border-dashed border-cyan-700 pb-4">
          <h1 className="text-4xl md:text-5xl font-bold text-cyan-300 tracking-wider">
            Projeto Explorador de Grafos
          </h1>
          <p className="text-slate-400 mt-2">Um Guia Interativo para a Teoria dos Grafos</p>
        </header>

        <nav className="flex justify-center items-center mb-8 bg-slate-800/50 rounded-lg p-2 backdrop-blur-sm">
          <TabButton tab="explanation" label="[ 01_TEORIA ]" />
          <TabButton tab="trends" label="[ 02_EXPLORADOR ]" />
          <TabButton tab="activity" label="[ 03_ATIVIDADE ]" />
        </nav>

        <main>
          {renderContent()}
        </main>
        
        <footer className="text-center mt-12 text-slate-500 text-sm">
            <p>Construído com React, Tailwind CSS e a API Gemini.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;