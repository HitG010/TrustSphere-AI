import { useState, useMemo } from "react";
import axios from "axios";
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
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
            console.log(res.data);
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
        <div className="w-full mx-auto px-4 py-8 items-center">
            <h1 className="text-xl font-bold mb-4 text-center">Trust Graph</h1>
            <div className="flex justify-center items-center">
                <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter Product ID"
                className="border p-2 mr-2 text-center"
                />
                <button type="button" onClick={fetchGraph} className="bg-blue-500 text-white px-4 py-2 ml-5">
                    Fetch Graph
                </button>
                <button type="button" onClick={fetchTop3} className="bg-blue-500 text-white px-4 py-2 ml-5">
                    Fetch Top 3 Rings
                </button>
            </div>
            {message && (
                <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded">
                    {message}
                </div>
            )}

            {graph && (
                <div className="mt-6 border-t pt-6 h-[600px] w-full bg-white rounded shadow">
                    <h2 className="text-lg font-semibold mb-2">Graph for Product: {productId}</h2>
                    <div className="h-full w-full">
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
                </div>
            )}

            {topRings.length > 0 && (
                <div className="mt-6 border-t pt-6">
                    <h2 className="text-lg font-semibold mb-4">Top 3 Rings</h2>
                    {topRings.map((ring, idx) => {
                        const { nodes, edges } = convertToReactFlowData(
                            ring.nodes,
                            ring.edges,
                            ring.ring_id
                        );
                        return (
                            <div
                                key={ring.ring_id}
                                className="mb-6 p-4 border rounded bg-gray-50"
                            >
                                <h3 className="font-medium mb-2">Ring #{idx + 1} — Ring ID: {ring.ring_id}</h3>
                                <div className="h-[500px] w-full">
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
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

