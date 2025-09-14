import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit3, Trash2, Share2, Download, Brain } from 'lucide-react';

const MindMap = ({ topic = "Programming Concepts", onSave }) => {
  const canvasRef = useRef(null);
  const [nodes, setNodes] = useState([
    { id: 1, x: 400, y: 200, text: topic, level: 0, color: '#3B82F6', children: [2, 3, 4] },
    { id: 2, x: 200, y: 100, text: 'Variables', level: 1, color: '#10B981', children: [5, 6] },
    { id: 3, x: 200, y: 200, text: 'Functions', level: 1, color: '#F59E0B', children: [7, 8] },
    { id: 4, x: 200, y: 300, text: 'Data Types', level: 1, color: '#EF4444', children: [9, 10] },
    { id: 5, x: 50, y: 50, text: 'let/const', level: 2, color: '#8B5CF6', children: [] },
    { id: 6, x: 50, y: 150, text: 'Scope', level: 2, color: '#8B5CF6', children: [] },
    { id: 7, x: 50, y: 180, text: 'Parameters', level: 2, color: '#EC4899', children: [] },
    { id: 8, x: 50, y: 220, text: 'Return', level: 2, color: '#EC4899', children: [] },
    { id: 9, x: 50, y: 280, text: 'String', level: 2, color: '#06B6D4', children: [] },
    { id: 10, x: 50, y: 350, text: 'Number', level: 2, color: '#06B6D4', children: [] }
  ]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [editingNode, setEditingNode] = useState(null);
  const [newNodeText, setNewNodeText] = useState('');

  useEffect(() => {
    drawMindMap();
  }, [nodes]);

  const drawMindMap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw connections
    nodes.forEach(node => {
      node.children.forEach(childId => {
        const child = nodes.find(n => n.id === childId);
        if (child) {
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(child.x, child.y);
          ctx.strokeStyle = '#E5E7EB';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    });
    
    // Draw nodes
    nodes.forEach(node => {
      const radius = 20 + (3 - node.level) * 10;
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();
      ctx.strokeStyle = selectedNode?.id === node.id ? '#1F2937' : '#FFFFFF';
      ctx.lineWidth = selectedNode?.id === node.id ? 3 : 2;
      ctx.stroke();
      
      // Node text
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${12 + (3 - node.level) * 2}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const maxWidth = radius * 1.5;
      const words = node.text.split(' ');
      let line = '';
      let y = node.y;
      
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, node.x, y);
          line = words[n] + ' ';
          y += 16;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, node.x, y);
    });
  };

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= 20 + (3 - node.level) * 10;
    });
    
    setSelectedNode(clickedNode);
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const clickedNode = nodes.find(node => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= 20 + (3 - node.level) * 10;
    });
    
    if (clickedNode) {
      setDragging({ node: clickedNode, offsetX: x - clickedNode.x, offsetY: y - clickedNode.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setNodes(prev => prev.map(node => 
      node.id === dragging.node.id 
        ? { ...node, x: x - dragging.offsetX, y: y - dragging.offsetY }
        : node
    ));
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const addNode = () => {
    if (!selectedNode || !newNodeText.trim()) return;
    
    const newId = Math.max(...nodes.map(n => n.id)) + 1;
    const angle = Math.random() * 2 * Math.PI;
    const distance = 100;
    
    const newNode = {
      id: newId,
      x: selectedNode.x + Math.cos(angle) * distance,
      y: selectedNode.y + Math.sin(angle) * distance,
      text: newNodeText.trim(),
      level: selectedNode.level + 1,
      color: ['#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'][selectedNode.level % 4],
      children: []
    };
    
    setNodes(prev => [
      ...prev,
      newNode,
      ...prev.map(node => 
        node.id === selectedNode.id 
          ? { ...node, children: [...node.children, newId] }
          : node
      )
    ]);
    
    setNewNodeText('');
  };

  const deleteNode = () => {
    if (!selectedNode || selectedNode.level === 0) return;
    
    setNodes(prev => prev
      .filter(node => node.id !== selectedNode.id)
      .map(node => ({
        ...node,
        children: node.children.filter(childId => childId !== selectedNode.id)
      }))
    );
    
    setSelectedNode(null);
  };

  const editNode = () => {
    if (!selectedNode) return;
    setEditingNode(selectedNode);
    setNewNodeText(selectedNode.text);
  };

  const saveEdit = () => {
    if (!editingNode || !newNodeText.trim()) return;
    
    setNodes(prev => prev.map(node => 
      node.id === editingNode.id 
        ? { ...node, text: newNodeText.trim() }
        : node
    ));
    
    setEditingNode(null);
    setNewNodeText('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Brain className="w-6 h-6 mr-2" />
            Mind Map: {topic}
          </h3>
          <div className="flex space-x-2">
            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <Share2 className="w-4 h-4 text-white" />
            </button>
            <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <Download className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="border-2 border-gray-200 rounded-lg cursor-pointer w-full"
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
      </div>

      <div className="border-t bg-gray-50 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={newNodeText}
              onChange={(e) => setNewNodeText(e.target.value)}
              placeholder={editingNode ? "Edit node text..." : "Add new node..."}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && (editingNode ? saveEdit() : addNode())}
            />
          </div>
          
          <div className="flex space-x-2">
            {editingNode ? (
              <>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setEditingNode(null);
                    setNewNodeText('');
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={addNode}
                  disabled={!selectedNode || !newNodeText.trim()}
                  className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </button>
                <button
                  onClick={editNode}
                  disabled={!selectedNode}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={deleteNode}
                  disabled={!selectedNode || selectedNode?.level === 0}
                  className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
        
        {selectedNode && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Selected: <span className="font-semibold">{selectedNode.text}</span>
              {selectedNode.level === 0 && " (Root node - cannot be deleted)"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MindMap;
