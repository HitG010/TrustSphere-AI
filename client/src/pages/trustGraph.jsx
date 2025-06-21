import { useState } from "react";
import axios from "axios";

export default function TrustGraph() {
    const [productId, setProductId] = useState("");
    const [graph, setGraph] = useState(null);
    const [topRings, setTopRings] = useState([]);
    const [message, setMessage] = useState("");

    const fetchGraph = async () => {
        console.log("Request for API gone");
        
        try {
            const res = await axios.post("http://localhost:5000/api/graph", { productId });
            if(res.data.status === 'success'){
                setGraph(res.data);
                setTopRings([]);
                setMessage("");
                console.log(res.data);
            }
            else{
                setGraph(null);
                console.log(res.data);
                setMessage(res.data.message)
                setGraph(null);
                setTopRings([]);
            }
            
        } catch (err) {
            console.error("Error fetching graph:", err);
        }
    };

    const fetchTop3 = async() => {
        console.log("Request gone");
        try {
            const res = await axios.post("http://localhost:5000/api/graph");
            console.log("Top rings data", res.data);
            setTopRings(res.data.top_rings);
            setGraph(null);
        } catch(e) {
            console.err("Error :", err);
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold mb-4">Trust Graph</h1>
        <input
            type="text"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            placeholder="Enter Product ID"
            className="border p-2 mr-2"
        />
        <button type="button" onClick={fetchGraph} className="bg-blue-500 text-white px-4 py-2">
            Fetch Graph
        </button>
        <br/>
        <button type="button" onClick={fetchTop3} className="bg-blue-500 text-white px-4 py-2 w-full mt-5">
            Fetch Top 3 Nodes
        </button>
        {message && (
            <div className="mt-4 p-4 bg-yellow-100 text-yellow-800 rounded">
                {message}
            </div>
        )}

        {graph && (
            <div className="mt-6 border-t pt-6">
                <h2 className="text-lg font-semibold mb-2">Graph for Product: {productId}</h2>
                <div className="bg-gray-100 p-4 rounded text-sm overflow-auto">
                    <h3 className="font-medium">Nodes</h3>
                    <pre>{JSON.stringify(graph.rings[0].nodes, null, 2)}</pre>
                    <h3 className="font-medium mt-4">Edges</h3>
                    <pre>{JSON.stringify(graph.rings[0].edges, null, 2)}</pre>
                </div>
            </div>
        )}

        {topRings.length > 0 && (
            <div className="mt-6 border-t pt-6">
            <h2 className="text-lg font-semibold mb-4">Top 3 Rings</h2>
            {topRings.map((ring, idx) => (
                <div key={ring.ring_id} className="mb-6 p-4 border rounded bg-gray-50">
                <h3 className="font-medium mb-2">Ring #{idx + 1} — Ring ID: {ring.ring_id}</h3>
                <div className="text-sm">
                    <strong>Users:</strong> {ring.users.join(", ")}
                </div>
                <div className="text-sm mt-1">
                    <strong>Score:</strong> {JSON.stringify(ring.score)}
                </div>
                <div className="mt-2">
                    <h4 className="font-semibold">Nodes</h4>
                    <pre>{JSON.stringify(ring.nodes, null, 2)}</pre>
                </div>
                <div className="mt-2">
                    <h4 className="font-semibold">Edges</h4>
                    <pre>{JSON.stringify(ring.edges, null, 2)}</pre>
                </div>
                </div>
            ))}
            </div>
        )}
        </div>
    );
}
