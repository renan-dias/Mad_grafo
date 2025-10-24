
import React from 'react';
import ReactFlow, { Node, Edge, Background, BackgroundVariant, ProOptions } from 'reactflow';

interface ExampleGraphProps {
  nodes: Node[];
  edges: Edge[];
  fitView?: boolean;
}

const proOptions: ProOptions = { hideAttribution: true };

const ExampleGraph: React.FC<ExampleGraphProps> = ({ nodes, edges, fitView = true }) => {
  return (
    <div className="w-full h-48 rounded-lg bg-slate-900/50 mt-4 border border-cyan-900">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        proOptions={proOptions}
        nodesDraggable={false}
        nodesConnectable={false}
        zoomOnScroll={false}
        panOnDrag={false}
        zoomOnDoubleClick={false}
        fitView={fitView}
        style={{ background: '#0f172a' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} color="#1e293b" />
      </ReactFlow>
    </div>
  );
};

export default ExampleGraph;
