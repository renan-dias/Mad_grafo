import React, { useState, useCallback, useRef, useEffect, DragEvent } from 'react';
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
  Connection,
  addEdge,
  NodeTypes,
} from 'reactflow';
import { generateActivityScenarios, validateUserGraph } from '../services/geminiService';
import { UserIcon, PostIcon, CommentIcon, CustomerIcon, OrderIcon, ProductIcon, ProjectIcon, TaskIcon } from './icons/SocialIcons';
import IconNode from './customNodes/IconNode';
import ExportModal from './ExportModal';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { CustomNodeData } from '../types';

let id = 0;
const getId = () => `dndnode_${id++}`;

const nodeTypes: NodeTypes = {
  iconNode: IconNode,
};

const scenarioNodeConfig = [
    // Cenário 0: Rede Social
    [
        { type: 'usuario', label: 'Usuário', icon: <UserIcon /> },
        { type: 'publicacao', label: 'Publicação', icon: <PostIcon /> },
        { type: 'comentario', label: 'Comentário', icon: <CommentIcon /> },
    ],
    // Cenário 1: E-commerce
    [
        { type: 'cliente', label: 'Cliente', icon: <CustomerIcon /> },
        { type: 'pedido', label: 'Pedido', icon: <OrderIcon /> },
        { type: 'produto', label: 'Produto', icon: <ProductIcon /> },
    ],
    // Cenário 2: Gestão de Projetos
    [
        { type: 'projeto', label: 'Projeto', icon: <ProjectIcon /> },
        { type: 'tarefa', label: 'Tarefa', icon: <TaskIcon /> },
        { type: 'usuario', label: 'Usuário', icon: <UserIcon /> },
    ]
];

const icons: { [key: string]: React.ReactNode } = {
    usuario: <UserIcon />,
    publicacao: <PostIcon />,
    comentario: <CommentIcon />,
    cliente: <CustomerIcon />,
    pedido: <OrderIcon />,
    produto: <ProductIcon />,
    projeto: <ProjectIcon />,
    tarefa: <TaskIcon />,
};

const DraggableNode: React.FC<{ type: string, label: string, icon: React.ReactNode }> = ({ type, label, icon }) => {
    const onDragStart = (event: DragEvent<HTMLDivElement>, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div 
            className="flex flex-col items-center justify-center p-2 border-2 border-dashed border-cyan-700 rounded-md text-center text-cyan-400 cursor-grab hover:bg-cyan-900/50 hover:border-solid transition-all"
            onDragStart={(event) => onDragStart(event, type)}
            draggable
        >
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </div>
    );
};

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700 rounded"></div>
        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
    </div>
);

const GraphActivity: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [scenarios, setScenarios] = useState<string[]>([]);
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{correct: boolean; feedback: string} | null>(null);
  const [completedScenarios, setCompletedScenarios] = useState<Set<number>>(new Set());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const graphRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const fetchScenarios = async () => {
        try {
            const fetchedScenarios = await generateActivityScenarios();
            setScenarios(fetchedScenarios);
        } catch (error) {
            console.error("Falha ao carregar cenários:", error);
            setScenarios(["Erro: Não foi possível carregar um cenário. Por favor, atualize a página."]);
        } finally {
            setIsLoading(false);
        }
    };
    fetchScenarios();
  }, []);

  const onNodesChange: OnNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange: OnEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);
  const onConnect = useCallback((params: Connection) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current || !reactFlowInstance) return;
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) return;

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      const config = scenarioNodeConfig[currentScenarioIndex].find(c => c.type === type);

      const newNode: Node<CustomNodeData> = {
        id: getId(),
        type: 'iconNode',
        position,
        data: { label: config ? config.label : 'Nó', icon: icons[type] },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, currentScenarioIndex]
  );
  
  const handleValidate = async () => {
    setIsValidating(true);
    setValidationResult(null);
    const graphData = {
        nodes: nodes.map(n => ({ id: n.id, type: scenarioNodeConfig[currentScenarioIndex].find(c => c.label === n.data.label)?.type || 'unknown' })),
        edges: edges.map(e => ({ source: e.source, target: e.target }))
    };
    try {
        const result = await validateUserGraph(scenarios[currentScenarioIndex], graphData);
        setValidationResult(result);
        if (result.correct) {
            setCompletedScenarios(prev => new Set(prev).add(currentScenarioIndex));
        }
    } catch (error) {
        console.error("Validação falhou:", error);
        setValidationResult({correct: false, feedback: "Ocorreu um erro durante a validação. Por favor, tente novamente."});
    } finally {
        setIsValidating(false);
    }
  };

  const handleNext = () => {
    setNodes([]);
    setEdges([]);
    setValidationResult(null);
    setCurrentScenarioIndex((prev) => (prev + 1) % (scenarios.length || 1));
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
            pdf.text(`Atividade com Grafos - por ${name}`, 20, 20);
            pdf.setFontSize(8);
            pdf.text(`Cenário ${currentScenarioIndex + 1}:`, 20, 40);
            const scenarioLines = pdf.splitTextToSize(scenarios[currentScenarioIndex], canvas.width - 40);
            pdf.text(scenarioLines, 20, 50);

            if(validationResult) {
                const resultText = validationResult.correct ? "Resultado: Correto" : "Resultado: Incorreto";
                const feedbackLines = pdf.splitTextToSize(`Feedback: ${validationResult.feedback}`, canvas.width - 40);
                const feedbackY = 50 + (scenarioLines.length * 10) + 10;
                pdf.text(resultText, 20, feedbackY - 10);
                pdf.text(feedbackLines, 20, feedbackY);
            }

            pdf.save(`atividade_grafos_${name.replace(/\s/g, '_')}.pdf`);
        } catch(error) {
            console.error("Exportação para PDF falhou", error);
        }
    }
  };

  const allScenariosComplete = scenarios.length > 0 && completedScenarios.size === scenarios.length;

  return (
    <div className="p-6 bg-slate-800/50 border border-dashed border-cyan-800 rounded-lg shadow-lg backdrop-blur-sm animate-fade-in">
      <h2 className="text-2xl font-bold text-cyan-300 mb-4">
        [ 03_ATIVIDADE_COM_GRAFOS ]
      </h2>
      <div className="mb-4 p-4 border border-cyan-800 rounded-md bg-slate-900/50">
        <h3 className="font-bold text-cyan-400 mb-2">Cenário {currentScenarioIndex + 1} de {scenarios.length || '...'}:</h3>
        {isLoading ? <LoadingSkeleton /> : <p className="text-slate-300">{scenarios[currentScenarioIndex]}</p>}
      </div>
      
      {allScenariosComplete ? (
        <div className="text-center p-8 bg-slate-900/50 border border-green-500 rounded-lg my-4 flex flex-col items-center justify-center h-[500px]">
            <h3 className="text-2xl font-bold text-green-400">Parabéns!</h3>
            <p className="text-slate-300 mt-2">Você completou todas as atividades com sucesso. Agora você pode exportar seu trabalho.</p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="md:w-1/4 lg:w-1/5 p-4 border border-cyan-800 rounded-md bg-slate-900/50">
                <h4 className="font-bold text-center text-cyan-400 mb-4">ARRASTE OS ELEMENTOS</h4>
                <div className="grid grid-cols-2 gap-4">
                    {!isLoading && scenarios.length > 0 && scenarioNodeConfig[currentScenarioIndex]?.map(node => (
                        <DraggableNode key={node.type} type={node.type} label={node.label} icon={node.icon} />
                    ))}
                </div>
                <p className="text-xs text-slate-500 mt-4 text-center">Arraste estes nós para a tela e conecte-os para modelar o cenário.</p>
            </div>

            <div className="flex-grow h-[500px] border border-cyan-700 rounded-lg bg-slate-900/70" ref={reactFlowWrapper}>
                <div className="w-full h-full" ref={graphRef}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        nodeTypes={nodeTypes}
                        fitView
                    >
                        <Controls 
                            style={{ position: 'absolute', bottom: 10, left: 10 }}
                            className="[&_button]:bg-slate-700 [&_button]:border-cyan-700 [&_button:hover]:bg-slate-600 [&_path]:fill-cyan-300"/>
                        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1e293b" />
                    </ReactFlow>
                </div>
            </div>
        </div>
      )}

      <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="w-full sm:w-auto min-h-[50px] flex items-center">
            {validationResult && (
                 <div className={`p-3 rounded-md text-sm w-full ${validationResult.correct ? 'bg-green-500/20 text-green-300 border border-green-500' : 'bg-red-500/20 text-red-300 border border-red-500'}`}>
                    <strong className="font-bold">{validationResult.correct ? "CORRETO" : "INCORRETO"}: </strong> {validationResult.feedback}
                 </div>
            )}
        </div>
        <div className="flex gap-4 w-full sm:w-auto flex-shrink-0">
          <button onClick={handleValidate} disabled={isValidating || nodes.length === 0} className="w-full sm:w-auto px-6 py-2 bg-cyan-600 text-slate-900 font-bold rounded-md hover:bg-cyan-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
              {isValidating ? 'Validando...' : 'Verificar'}
          </button>
          <button onClick={handleNext} disabled={allScenariosComplete || currentScenarioIndex === scenarios.length - 1} className="w-full sm:w-auto px-6 py-2 bg-slate-700 text-cyan-300 font-bold rounded-md hover:bg-slate-600 transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">
              Próximo
          </button>
           <div className="relative group w-full sm:w-auto">
              <button onClick={() => setIsModalOpen(true)} disabled={!allScenariosComplete} className="w-full sm:w-auto px-6 py-2 border border-cyan-500 text-cyan-400 font-bold rounded-md hover:bg-cyan-500 hover:text-slate-900 transition-colors disabled:border-slate-600 disabled:text-slate-500 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                  Exportar
              </button>
              {!allScenariosComplete && (
                  <div className="absolute bottom-full mb-2 w-max px-3 py-1.5 bg-slate-900 text-slate-300 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none left-1/2 -translate-x-1/2 border border-slate-700 z-10">
                      Complete todos os {scenarios.length} cenários para exportar.
                  </div>
              )}
          </div>
        </div>
      </div>
       <ExportModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleExport}
      />
    </div>
  );
};

export default GraphActivity;