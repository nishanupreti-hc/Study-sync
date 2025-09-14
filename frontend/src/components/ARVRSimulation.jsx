import React, { useState, useRef, useEffect } from 'react';
import { Cube, Eye, RotateCcw, Zap, Atom, Beaker, Globe } from 'lucide-react';

const ARVRSimulation = ({ type = 'chemistry' }) => {
  const canvasRef = useRef(null);
  const [isVRMode, setIsVRMode] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedMolecule, setSelectedMolecule] = useState('water');
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);

  const molecules = {
    water: {
      name: 'Water (H₂O)',
      atoms: [
        { element: 'O', x: 0, y: 0, z: 0, color: '#FF0000', radius: 20 },
        { element: 'H', x: -30, y: 20, z: 0, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: 30, y: 20, z: 0, color: '#FFFFFF', radius: 12 }
      ],
      bonds: [
        { from: 0, to: 1, type: 'single' },
        { from: 0, to: 2, type: 'single' }
      ],
      description: 'Water molecule showing bent molecular geometry'
    },
    methane: {
      name: 'Methane (CH₄)',
      atoms: [
        { element: 'C', x: 0, y: 0, z: 0, color: '#000000', radius: 18 },
        { element: 'H', x: 25, y: 25, z: 25, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: -25, y: -25, z: 25, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: -25, y: 25, z: -25, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: 25, y: -25, z: -25, color: '#FFFFFF', radius: 12 }
      ],
      bonds: [
        { from: 0, to: 1, type: 'single' },
        { from: 0, to: 2, type: 'single' },
        { from: 0, to: 3, type: 'single' },
        { from: 0, to: 4, type: 'single' }
      ],
      description: 'Methane showing tetrahedral geometry'
    },
    benzene: {
      name: 'Benzene (C₆H₆)',
      atoms: [
        { element: 'C', x: 40, y: 0, z: 0, color: '#000000', radius: 18 },
        { element: 'C', x: 20, y: 35, z: 0, color: '#000000', radius: 18 },
        { element: 'C', x: -20, y: 35, z: 0, color: '#000000', radius: 18 },
        { element: 'C', x: -40, y: 0, z: 0, color: '#000000', radius: 18 },
        { element: 'C', x: -20, y: -35, z: 0, color: '#000000', radius: 18 },
        { element: 'C', x: 20, y: -35, z: 0, color: '#000000', radius: 18 },
        { element: 'H', x: 60, y: 0, z: 0, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: 30, y: 52, z: 0, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: -30, y: 52, z: 0, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: -60, y: 0, z: 0, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: -30, y: -52, z: 0, color: '#FFFFFF', radius: 12 },
        { element: 'H', x: 30, y: -52, z: 0, color: '#FFFFFF', radius: 12 }
      ],
      bonds: [
        { from: 0, to: 1, type: 'aromatic' },
        { from: 1, to: 2, type: 'aromatic' },
        { from: 2, to: 3, type: 'aromatic' },
        { from: 3, to: 4, type: 'aromatic' },
        { from: 4, to: 5, type: 'aromatic' },
        { from: 5, to: 0, type: 'aromatic' }
      ],
      description: 'Benzene ring showing aromatic structure'
    }
  };

  const simulations = {
    chemistry: {
      title: 'Molecular Chemistry Lab',
      icon: Beaker,
      description: 'Explore 3D molecular structures and chemical bonds'
    },
    physics: {
      title: 'Physics Simulation',
      icon: Atom,
      description: 'Visualize atomic structures and particle interactions'
    },
    geography: {
      title: 'Earth Sciences',
      icon: Globe,
      description: 'Interactive 3D models of geological formations'
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const animate = () => {
      drawMolecule(ctx);
      if (isVRMode) {
        setRotation(prev => ({
          x: prev.x + 0.5 * animationSpeed,
          y: prev.y + 1 * animationSpeed,
          z: prev.z + 0.3 * animationSpeed
        }));
      }
      requestAnimationFrame(animate);
    };
    animate();
  }, [selectedMolecule, rotation, zoom, showLabels, isVRMode, animationSpeed]);

  const drawMolecule = (ctx) => {
    const canvas = canvasRef.current;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const molecule = molecules[selectedMolecule];
    
    // Draw bonds first
    molecule.bonds.forEach(bond => {
      const atom1 = molecule.atoms[bond.from];
      const atom2 = molecule.atoms[bond.to];
      
      const pos1 = project3D(atom1, centerX, centerY);
      const pos2 = project3D(atom2, centerX, centerY);
      
      ctx.beginPath();
      ctx.moveTo(pos1.x, pos1.y);
      ctx.lineTo(pos2.x, pos2.y);
      
      switch (bond.type) {
        case 'single':
          ctx.strokeStyle = '#666666';
          ctx.lineWidth = 3;
          break;
        case 'double':
          ctx.strokeStyle = '#444444';
          ctx.lineWidth = 5;
          break;
        case 'aromatic':
          ctx.strokeStyle = '#8B5CF6';
          ctx.lineWidth = 4;
          break;
      }
      ctx.stroke();
    });
    
    // Draw atoms
    molecule.atoms.forEach((atom, index) => {
      const pos = project3D(atom, centerX, centerY);
      
      // Atom sphere with gradient
      const gradient = ctx.createRadialGradient(
        pos.x - atom.radius * 0.3, pos.y - atom.radius * 0.3, 0,
        pos.x, pos.y, atom.radius * zoom
      );
      gradient.addColorStop(0, lightenColor(atom.color, 40));
      gradient.addColorStop(1, atom.color);
      
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, atom.radius * zoom, 0, 2 * Math.PI);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = '#333333';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Element label
      if (showLabels) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${14 * zoom}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(atom.element, pos.x, pos.y);
      }
    });
    
    // VR Mode indicator
    if (isVRMode) {
      ctx.fillStyle = 'rgba(139, 92, 246, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = '#8B5CF6';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VR MODE ACTIVE', centerX, 30);
    }
  };

  const project3D = (atom, centerX, centerY) => {
    // Simple 3D to 2D projection with rotation
    const rad = Math.PI / 180;
    const cosX = Math.cos(rotation.x * rad);
    const sinX = Math.sin(rotation.x * rad);
    const cosY = Math.cos(rotation.y * rad);
    const sinY = Math.sin(rotation.y * rad);
    const cosZ = Math.cos(rotation.z * rad);
    const sinZ = Math.sin(rotation.z * rad);
    
    // Rotate around X axis
    let y = atom.y * cosX - atom.z * sinX;
    let z = atom.y * sinX + atom.z * cosX;
    
    // Rotate around Y axis
    let x = atom.x * cosY + z * sinY;
    z = -atom.x * sinY + z * cosY;
    
    // Rotate around Z axis
    const finalX = x * cosZ - y * sinZ;
    const finalY = x * sinZ + y * cosZ;
    
    return {
      x: centerX + finalX * zoom,
      y: centerY + finalY * zoom
    };
  };

  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) { // Left mouse button
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaX = e.clientX - rect.left - rect.width / 2;
      const deltaY = e.clientY - rect.top - rect.height / 2;
      
      setRotation(prev => ({
        x: prev.x + deltaY * 0.5,
        y: prev.y + deltaX * 0.5,
        z: prev.z
      }));
    }
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0, z: 0 });
    setZoom(1);
  };

  const SimulationIcon = simulations[type].icon;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center">
              <SimulationIcon className="w-6 h-6 mr-2" />
              {simulations[type].title}
            </h3>
            <p className="text-purple-100 mt-1">{simulations[type].description}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsVRMode(!isVRMode)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                isVRMode ? 'bg-white text-purple-600' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isVRMode ? 'Exit VR' : 'VR Mode'}
            </button>
            <button
              onClick={resetView}
              className="flex items-center px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
          </div>
        </div>

        {type === 'chemistry' && (
          <div className="flex flex-wrap gap-2">
            {Object.keys(molecules).map(key => (
              <button
                key={key}
                onClick={() => setSelectedMolecule(key)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedMolecule === key 
                    ? 'bg-white text-purple-600' 
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {molecules[key].name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 3D Visualization */}
          <div className="lg:col-span-3">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                className="border-2 border-gray-200 rounded-lg cursor-move w-full"
                onMouseMove={handleMouseMove}
              />
              
              {/* Controls Overlay */}
              <div className="absolute top-4 right-4 bg-white/90 rounded-lg p-3 space-y-2">
                <div className="text-xs text-gray-600">Controls:</div>
                <div className="text-xs">🖱️ Drag to rotate</div>
                <div className="text-xs">🔍 Scroll to zoom</div>
                <div className="text-xs">👁️ VR for auto-rotate</div>
              </div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center">
                <Cube className="w-4 h-4 mr-2" />
                View Controls
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Zoom</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Animation Speed</label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.5"
                    value={animationSpeed}
                    onChange={(e) => setAnimationSpeed(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={showLabels}
                    onChange={(e) => setShowLabels(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm">Show Labels</span>
                </label>
              </div>
            </div>

            {type === 'chemistry' && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Molecule Info</h4>
                <div className="text-sm text-blue-700">
                  <div className="font-medium">{molecules[selectedMolecule].name}</div>
                  <div className="mt-1">{molecules[selectedMolecule].description}</div>
                  <div className="mt-2">
                    <span className="font-medium">Atoms:</span> {molecules[selectedMolecule].atoms.length}
                  </div>
                  <div>
                    <span className="font-medium">Bonds:</span> {molecules[selectedMolecule].bonds.length}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                <Zap className="w-4 h-4 mr-1" />
                Interactive Features
              </h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Real-time 3D rotation</li>
                <li>• VR-style auto-animation</li>
                <li>• Molecular bond visualization</li>
                <li>• Element identification</li>
                <li>• Zoom and pan controls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ARVRSimulation;
