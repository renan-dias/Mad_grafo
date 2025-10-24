
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { CustomNodeData } from '../../types';

const IconNode: React.FC<NodeProps<CustomNodeData>> = ({ data }) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-md bg-slate-800 border-2 border-cyan-600 w-40">
      <div className="flex items-center justify-center">
        <div className="rounded-full w-12 h-12 flex justify-center items-center bg-slate-700 text-cyan-300">
            {data.icon}
        </div>
        <div className="ml-3">
          <div className="text-lg font-bold text-cyan-300">{data.label}</div>
        </div>
      </div>

      <Handle type="target" position={Position.Top} className="w-2 h-2 !bg-teal-400" />
      <Handle type="source" position={Position.Bottom} className="w-2 h-2 !bg-teal-400" />
    </div>
  );
};

export default memo(IconNode);
