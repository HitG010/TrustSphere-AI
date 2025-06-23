import { useState, useMemo } from "react";
import axios from "axios";
import ReactFlow, { Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

function convertToReactFlowData(nodes, edges, productId) {
    const centerX = 400;
    const centerY = 300;
    const radius = 200;
    const centerNodeId = productId.toString();

    const rfNodes = [];
    const rfEdges = [];

    rfNodes.push({
        id: centerNodeId,
        position: { x: centerX, y: centerY },
        data: { label: `Product: ${centerNodeId}` },
    });

    const userNodes = nodes.filter(
        (n) =>
            n.id?.toString() !== centerNodeId &&
            n.userId?.toString() !== centerNodeId
    );

    userNodes.forEach((node, index) => {
        const angle = (2 * Math.PI * index) / userNodes.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        const id = node.id?.toString() || node.userId?.toString() || Math.random().toString();

        rfNodes.push({
            id,
            position: { x, y },
            data: { label: node.label || node.userId || node.id || "User" },
        });

        rfEdges.push({
            id: `e-${id}-${centerNodeId}`,
            source: id,
            target: centerNodeId,
            animated: true,
        });
    });

    return { nodes: rfNodes, edges: rfEdges };
}

export default function TrustGraph() {
    const [productId, setProductId] = useState("");
    const [graph, setGraph] = useState(null);
    const [topRings, setTopRings] = useState([]);
    const [message, setMessage] = useState("");

    const fetchGraph = async () => {
        if (!productId.trim()) {
            setMessage("Please enter a valid Product ID.");
            setGraph(null);
            setTopRings([]);
            return;
        }
        try {
            const res = await axios.post("http://localhost:5000/api/graph", { productId });
            console.log(res);
            if (res.data.status === "success") {
                setGraph(res.data);
                setTopRings([]);
                setMessage("");
            } else {
                setGraph(null);
                setMessage(res.data.message);
                setTopRings([]);
            }
        } catch (err) {
            console.error("Error fetching graph:", err);
        }
    };

    const fetchTop3 = async () => {
        try {
            const res = await axios.post("http://localhost:5000/api/graph");
            setMessage("");
            setTopRings(res.data.top_rings);
            setGraph(null);
        } catch (err) {
            console.error("Error fetching top rings:", err);
        }
    };

    const mainGraph = useMemo(() => {
        if (!graph) return { nodes: [], edges: [] };
        return convertToReactFlowData(graph.rings[0].nodes, graph.rings[0].edges, productId);
    }, [graph, productId]);

    return (
        <div className="bg-gray-950 min-h-screen text-white px-6 py-10">
            <h1 className="text-3xl font-bold text-center mb-8 text-white">Trust Graph</h1>

            <div className="flex flex-col md:flex-row md:justify-center md:items-center gap-4 mb-8">
                <input
                    type="text"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="Enter Product ID"
                    className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
                <button
                    onClick={fetchGraph}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 rounded transition"
                >
                    Fetch Graph
                </button>
                <button
                    onClick={fetchTop3}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded transition"
                >
                    Fetch Top 3 Rings
                </button>
            </div>

            {message && (
                <div className="mb-6 p-4 rounded bg-yellow-100 text-yellow-900 text-center font-medium">
                    {message}
                </div>
            )}

            {graph && (
                <div className="bg-gray-900 p-6 rounded shadow-md w-full">
                    <h2 className="text-xl font-semibold mb-6 text-cyan-400">
                        Graph for Product: {productId}
                    </h2>
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Graph */}
                        <div className="h-[600px] w-full md:w-3/4 bg-gray-800 rounded">
                            <ReactFlow
                                nodes={mainGraph.nodes}
                                edges={mainGraph.edges}
                                fitView
                                fitViewOptions={{ padding: 0.2 }}
                                proOptions={{ hideAttribution: true }}
                            >
                                <Controls />
                                <Background />
                            </ReactFlow>
                        </div>

                        {/* Scores */}
                        <div className="bg-gray-800 p-6 rounded w-full md:w-1/4 text-white flex flex-col shadow">
                            <h4 className="text-3xl font-semibold text-green-400 mb-6">Scores</h4>
                            <ul className="space-y-4 text-xl gap-6">
                                <li><span className="text-cyan-300"># Products:</span> {graph.rings[0].score.num_products}</li>
                                <li><span className="text-cyan-300"># Users:</span> {graph.rings[0].score.num_users}</li>
                                <li><span className="text-cyan-300">Rating Std:</span> {graph.rings[0].score.rating_std?.toFixed(3)}</li>
                                <li><span className="text-cyan-300">Text Similarity:</span> {graph.rings[0].score.text_similarity?.toFixed(3)}</li>
                                <li><span className="text-cyan-300">Time Std:</span> {graph.rings[0].score.time_std?.toFixed(2)}</li>
                            </ul>
                        </div>
                    </div>
                </div>
              )}


            {topRings.length > 0 && (
                <div className="mt-10">
                    <h2 className="text-2xl font-semibold mb-6 text-green-400 text-center">
                        Top 3 Rings
                    </h2>
                    {topRings.map((ring, idx) => {
                        const productId = ring.products[0];
                        const { nodes, edges } = convertToReactFlowData(
                            ring.nodes,
                            ring.edges,
                            productId
                        );
                        const score = ring.score;

                        return (
                            <div key={ring.ring_id} className="mb-10 p-6 bg-gray-900 rounded shadow-md">
                                <h3 className="text-lg font-medium text-white mb-2">
                                    Ring #{idx + 1} — ProductID:{" "}
                                    <span className="text-cyan-400">{productId}</span>
                                </h3>

                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Graph */}
                                    <div className="h-[500px] w-full md:w-3/4 bg-gray-800 rounded">
                                        <ReactFlow
                                            nodes={nodes}
                                            edges={edges}
                                            fitView
                                            fitViewOptions={{ padding: 0.2 }}
                                        >
                                            <Controls />
                                            <Background />
                                        </ReactFlow>
                                    </div>

                                    {/* Scores */}
                                    <div className="bg-gray-800 p-6 rounded w-full md:w-1/4 text-white flex flex-col  shadow">
                                        <h4 className="text-3xl font-semibold text-green-400 mb-6">Scores</h4>
                                        <ul className="space-y-4 text-xl gap-6">
                                            <li><span className="text-cyan-300"># Products:</span> {score.num_products}</li>
                                            <li><span className="text-cyan-300"># Users:</span> {score.num_users}</li>
                                            <li><span className="text-cyan-300">Rating Std:</span> {score.rating_std?.toFixed(3)}</li>
                                            <li><span className="text-cyan-300">Text Similarity:</span> {score.text_similarity?.toFixed(3)}</li>
                                            <li><span className="text-cyan-300">Time Std:</span> {score.time_std?.toFixed(2)}</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
