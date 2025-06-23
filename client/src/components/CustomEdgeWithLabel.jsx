// src/components/CustomEdgeWithLabel.js
import { getBezierPath, EdgeLabelRenderer } from 'reactflow';

const CustomEdgeWithLabel = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
  label,
  style = {},
  markerEnd,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  return (
    <>
      <path id={id} style={style} className="react-flow__edge-path" d={edgePath} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            padding: '4px 6px',
            background: '#111827',
            border: '1px solid #00FFFF',
            color: '#fff',
            fontSize: 12,
            borderRadius: 4,
          }}
        >
          ⭐ {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdgeWithLabel;
