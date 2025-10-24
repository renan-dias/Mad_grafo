import { GoogleGenAI, Type } from "@google/genai";

// Assume que a API_KEY está definida no ambiente
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

interface GraphNode {
    id: string;
    label: string;
}

interface GraphEdge {
    source: string;
    target: string;
}

interface GroundingSource {
    uri: string;
    title: string;
}

export const generateGraphFromTerms = async (terms: string): Promise<{ nodes: GraphNode[], edges: GraphEdge[], sources: GroundingSource[] }> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Com base nos seguintes termos de pesquisa: "${terms}", gere um grafo conceitual em português. O grafo deve representar as principais e mais atuais relações entre esses conceitos. Forneça a saída como um objeto JSON com duas chaves: "nodes" e "edges".
            - "nodes" deve ser um array de objetos, cada um com um "id" único (uma string simples) e um "label".
            - "edges" deve ser um array de objetos, cada um com "source" e "target", referenciando os IDs dos nós.
            Mantenha o grafo conciso, com 5 a 10 nós, se possível. Certifique-se de que a saída seja APENAS o objeto JSON bruto, sem qualquer formatação markdown como \`\`\`json.`,
            config: {
                tools: [{googleSearch: {}}],
            }
        });
        
        const jsonText = response.text.trim();
        const graphData = JSON.parse(jsonText);

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const sources = groundingChunks
            .map(chunk => ({
                uri: chunk.web?.uri ?? '',
                title: chunk.web?.title ?? 'Fonte sem título'
            }))
            .filter(source => source.uri);
        
        const uniqueSources = Array.from(new Map(sources.map(item => [item['uri'], item])).values());

        return { ...graphData, sources: uniqueSources };

    } catch (error) {
        console.error("Erro ao gerar grafo a partir dos termos:", error);
        if (error instanceof SyntaxError) {
             throw new Error("A IA retornou um formato inválido. Por favor, tente reformular sua consulta.");
        }
        throw new Error("Falha na comunicação com o modelo de IA.");
    }
};

export const generateActivityScenarios = async (): Promise<string[]> => {
     try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Gere 3 cenários distintos e concisos em português, descrevendo um sistema que pode ser representado como um grafo.
            - Cenário 1: Modele uma interação simples de rede social: Um 'Usuário' cria uma 'Publicação', e outro 'Usuário' adiciona um 'Comentário' a essa 'Publicação'.
            - Cenário 2: Modele um fluxo básico de e-commerce: Um 'Cliente' faz um 'Pedido' que contém pelo menos um 'Produto'.
            - Cenário 3: Modele um sistema de gerenciamento de projetos: Um 'Usuário' é atribuído a uma 'Tarefa', e essa 'Tarefa' pertence a um 'Projeto'.
            Retorne um objeto JSON com uma única chave "scenarios", que é um array dessas 3 strings de cenário.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        scenarios: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const data = JSON.parse(jsonText);
        return data.scenarios;
    } catch (error) {
        console.error("Erro ao gerar cenários:", error);
        throw new Error("Falha na comunicação com o modelo de IA para gerar cenários.");
    }
};

interface UserGraph {
    nodes: { id: string; type: string }[];
    edges: { source: string; target: string }[];
}

export const validateUserGraph = async (scenario: string, userGraph: UserGraph): Promise<{ correct: boolean, feedback: string }> => {
    try {
        const prompt = `
            Cenário: "${scenario}"
            
            Modelo de grafo do usuário:
            ${JSON.stringify(userGraph, null, 2)}

            Analise o grafo do usuário. Ele modela corretamente as relações fundamentais descritas no cenário?
            Por exemplo, em uma rede social, um usuário cria uma publicação, e outro usuário comenta nessa publicação. As conexões devem refletir isso (ex: Usuário -> Publicação, Publicação -> Comentário).
            
            Avalie se as conexões fazem sentido lógico com base no cenário.
            
            Retorne sua resposta como um objeto JSON com duas chaves:
            1. "correct": um booleano (true se o modelo estiver fundamentalmente correto, false caso contrário).
            2. "feedback": uma explicação curta, em uma frase, para sua decisão, em português.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        correct: { type: Type.BOOLEAN },
                        feedback: { type: Type.STRING },
                    }
                }
            }
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Erro ao validar o grafo:", error);
        throw new Error("Falha ao validar o grafo com o modelo de IA.");
    }
};