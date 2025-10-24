import React, { useState, useCallback, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  BackgroundVariant,
} from 'reactflow';
import { generateGraphFromTerms } from '../services/geminiService';
import ExportModal from './ExportModal';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { CustomNodeData } from '../types';

interface GroundingSource {
    uri: string;
    title: string;
}

const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-4 h-4 rounded-full bg-cyan-300 animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 rounded-full bg-cyan-300 animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 rounded-full bg-cyan-300 animate-pulse"></div>
        <span className="ml-2 text-cyan-300">Gerando grafo...</span>
    </div>
);

const TrendsExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const handleGenerateGraph = async () => {
    if (!searchTerm.trim()) {
      setError('Por favor, insira um termo de busca.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setNodes([]);
    setEdges([]);
    setSources([]);
    try {
      const { nodes: newNodes, edges: newEdges, sources: newSources } = await generateGraphFromTerms(searchTerm);
      
      const flowNodes: Node<CustomNodeData>[] = newNodes.map((node, i) => ({
          id: node.id,
          data: { label: node.label },
          position: { x: Math.random() * 400, y: Math.random() * 400 },
          type: 'default',
          style: { 
            background: '#083344',
            color: '#67e8f9',
            border: '1px solid #06b6d4',
          }
      }));

      const flowEdges: Edge[] = newEdges.map(edge => ({
          id: `e-${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          animated: true,
          style: { stroke: '#22d3ee' }
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
      setSources(newSources);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.';
      setError(`Falha ao gerar o grafo. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleExport = async (name: string) => {
    setIsModalOpen(false);
    if (graphRef.current) {
      try {
        const canvas = await html2canvas(graphRef.current, { backgroundColor: '#0f172a' });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.setTextColor('#67e8f9');
        pdf.text(`Explorador de Grafos - por ${name}`, 20, 20);
        pdf.text(`Termo: ${searchTerm}`, 20, 40);
        pdf.save(`explorador_de_grafos_${name.replace(/\s/g, '_')}.pdf`);
      } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        setError("Não foi possível exportar para PDF.");
      }
    }
  };

  return (
    <div className="p-6 bg-slate-800/50 border border-dashed border-cyan-800 rounded-lg shadow-lg backdrop-blur-sm animate-fade-in">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4">
        [ 02_EXPLORADOR_DE_TENDÊNCIAS ]
      </h2>
      <p className="text-slate-400 mb-6">Digite um tópico ou vários tópicos separados por vírgula (ex: "React, Vue, Svelte") para gerar um grafo de relacionamento visual com base nas tendências atuais.</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ex: Inteligência Artificial, Aprendizado de Máquina"
          className="flex-grow bg-slate-900/50 border border-cyan-700 text-cyan-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none placeholder-slate-500"
          onKeyDown={(e) => e.key === 'Enter' && handleGenerateGraph()}
        />
        <button
          onClick={handleGenerateGraph}
          disabled={isLoading}
          className="px-6 py-2 bg-cyan-600 text-slate-900 font-bold rounded-md hover:bg-cyan-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Gerando...' : 'Gerar Grafo'}
        </button>
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}
      
      <div className="w-full h-[500px] border border-cyan-700 rounded-lg bg-slate-900/70 relative" ref={graphRef}>
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
                <LoadingSpinner />
            </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Controls 
            style={{ position: 'absolute', bottom: 10, left: 10 }}
            className="[&_button]:bg-slate-700 [&_button]:border-cyan-700 [&_button:hover]:bg-slate-600 [&_path]:fill-cyan-300"/>
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e293b" />
        </ReactFlow>
      </div>

      {sources.length > 0 && (
        <div className="mt-6 p-4 bg-slate-900/50 border border-dashed border-cyan-800 rounded-lg">
            <h3 className="text-lg font-bold text-cyan-300 mb-3">[ Fontes de Dados ]</h3>
            <ul className="space-y-2 text-sm">
                {sources.map((source, index) => (
                    <li key={index} className="flex items-start">
                        <span className="text-cyan-400 mr-2 pt-0.5">&#8618;</span>
                        <a 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-slate-300 hover:text-cyan-300 transition-colors truncate"
                            title={source.uri}
                        >
                            {source.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
      )}

       {nodes.length > 0 && !isLoading && (
        <div className="mt-4 text-right">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-2 border border-cyan-500 text-cyan-400 font-bold rounded-md hover:bg-cyan-500 hover:text-slate-900 transition-colors"
          >
            Exportar para PDF
          </button>
        </div>
      )}
      <ExportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleExport}
      />
    </div>
  );
};

export default TrendsExplorer;