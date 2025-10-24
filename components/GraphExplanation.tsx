import React from 'react';
import { Node, Edge, MarkerType } from 'reactflow';
import ExampleGraph from './ExampleGraph';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-8 p-6 bg-slate-800/50 border border-dashed border-cyan-800 rounded-lg shadow-lg backdrop-blur-sm animate-fade-in">
        <h2 className="text-2xl font-bold text-cyan-300 mb-4 border-b-2 border-cyan-700/50 pb-2">{title}</h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
            {children}
        </div>
    </div>
);

// Definições de dados dos grafos
const nodeStyle = { background: '#083344', color: '#67e8f9', border: '1px solid #06b6d4' };
const edgeStyle = { stroke: '#22d3ee' };

const undirectedNodes: Node[] = [
    { id: 'A', position: { x: 50, y: 50 }, data: { label: 'A' }, style: nodeStyle },
    { id: 'B', position: { x: 200, y: 50 }, data: { label: 'B' }, style: nodeStyle },
];
const undirectedEdges: Edge[] = [
    { id: 'eA-B', source: 'A', target: 'B', style: edgeStyle },
];

const directedNodes: Node[] = [
    { id: 'A', position: { x: 50, y: 50 }, data: { label: 'A' }, style: nodeStyle },
    { id: 'B', position: { x: 200, y: 50 }, data: { label: 'B' }, style: nodeStyle },
];
const directedEdges: Edge[] = [
    { id: 'eA-B', source: 'A', target: 'B', markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' }, style: edgeStyle },
];

const weightedNodes: Node[] = [
    { id: 'Cidade A', position: { x: 50, y: 50 }, data: { label: 'Cidade A' }, style: nodeStyle },
    { id: 'Cidade B', position: { x: 250, y: 50 }, data: { label: 'Cidade B' }, style: nodeStyle },
];
const weightedEdges: Edge[] = [
    { id: 'eA-B', source: 'Cidade A', target: 'Cidade B', label: '120km', style: edgeStyle, labelStyle: { fill: '#67e8f9', fontWeight: 'bold' } },
];

const cyclicNodes: Node[] = [
    { id: '1', position: { x: 50, y: 100 }, data: { label: '1' }, style: nodeStyle },
    { id: '2', position: { x: 150, y: 0 }, data: { label: '2' }, style: nodeStyle },
    { id: '3', position: { x: 250, y: 100 }, data: { label: '3' }, style: nodeStyle },
];
const cyclicEdges: Edge[] = [
    { id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' }, style: edgeStyle },
    { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' }, style: edgeStyle },
    { id: 'e3-1', source: '3', target: '1', markerEnd: { type: MarkerType.ArrowClosed, color: '#22d3ee' }, style: edgeStyle },
];


const GraphExplanation: React.FC = () => {
    return (
        <div>
            <Section title="[ O que é um Grafo? ]">
                <p>
                    Em ciência da computação, um grafo é uma estrutura de dados abstrata usada para representar conexões entre pares de objetos. Ele consiste em um conjunto de <strong className="text-cyan-400">vértices (ou nós)</strong> e um conjunto de <strong className="text-cyan-400">arestas</strong> que conectam esses vértices.
                </p>
                <p>
                    Pense em uma rede social: cada pessoa é um nó, e uma "amizade" é uma aresta conectando duas pessoas. As arestas representam o relacionamento entre os vértices. Elas podem ter uma <strong className="text-cyan-400">direção</strong>, indicando um fluxo (como em uma rua de mão única), ou podem ser não direcionadas (como uma amizade mútua). Este conceito simples é incrivelmente poderoso para modelar sistemas complexos.
                </p>
            </Section>

            <Section title="[ Tipos de Grafos ]">
                <ul className="list-disc list-inside space-y-6">
                    <li>
                        <strong className="text-cyan-400">Grafo Não Direcionado:</strong> As arestas não têm orientação. A aresta (A, B) é idêntica à aresta (B, A). É como uma amizade no Facebook.
                        <ExampleGraph nodes={undirectedNodes} edges={undirectedEdges} />
                    </li>
                    <li>
                        <strong className="text-cyan-400">Grafo Direcionado (Digrafo):</strong> As arestas têm uma direção. A aresta (A, B) vai de A para B, mas não necessariamente o contrário. É como "seguir" alguém no Twitter.
                        <ExampleGraph nodes={directedNodes} edges={directedEdges} />
                    </li>
                    <li>
                        <strong className="text-cyan-400">Grafo Ponderado:</strong> Cada aresta recebe um "peso" ou "custo" numérico. Pense em um mapa, onde os nós são cidades e os pesos das arestas são as distâncias entre elas.
                        <ExampleGraph nodes={weightedNodes} edges={weightedEdges} />
                    </li>
                    <li>
                        <strong className="text-cyan-400">Grafos Cíclicos e Acíclicos:</strong> Um grafo cíclico contém pelo menos um caminho que começa e termina no mesmo vértice. Um grafo acíclico não contém. Grafos Acíclicos Direcionados (DAGs) são cruciais para tarefas como agendamento de dependências.
                        <ExampleGraph nodes={cyclicNodes} edges={cyclicEdges} />
                    </li>
                </ul>
            </Section>

            <Section title="[ Importância no Desenvolvimento de Software ]">
                <p>
                    Grafos são a espinha dorsal de muitas aplicações de software modernas. Sua capacidade de modelar relacionamentos os torna indispensáveis para:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-4">
                    <li><strong className="text-cyan-400">Redes Sociais:</strong> Analisar conexões, sugerir amigos e entender estruturas de comunidades.</li>
                    <li><strong className="text-cyan-400">Mapas e Navegação:</strong> Encontrar o caminho mais curto entre dois pontos (ex: o Google Maps usa algoritmos como o de Dijkstra em um grafo de localizações).</li>
                    <li><strong className="text-cyan-400">Mecanismos de Recomendação:</strong> Recomendar produtos ou conteúdo com base nas relações entre usuários e itens (ex: "Usuários que compraram X também compraram Y").</li>
                    <li><strong className="text-cyan-400">World Wide Web:</strong> Motores de busca modelam a web como um imenso grafo direcionado onde as páginas são nós e os hyperlinks são arestas.</li>
                    <li><strong className="text-cyan-400">Compiladores e Gerenciamento de Dependências:</strong> Representar dependências entre módulos de código ou tarefas para determinar a ordem correta de execução.</li>
                </ul>
            </Section>
        </div>
    );
};

export default GraphExplanation;