import React, { useState, useEffect, useRef } from 'react';
import { Atom, Zap, Eye, Layers, Sparkles, Cpu, Orbit } from 'lucide-react';

const HolographicVisualization = ({ concept, data }) => {
  const canvasRef = useRef(null);
  const [hologramState, setHologramState] = useState({
    rotation: { x: 0, y: 0, z: 0 },
    particles: [],
    quantumFields: [],
    dimensions: 3,
    complexity: 0.7,
    aiEnhancement: true
  });
  const [isHolographic, setIsHolographic] = useState(true);
  const [quantumMode, setQuantumMode] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);

  useEffect(() => {
    initializeHologram();
    generateQuantumFields();
    startAIAnalysis();
  }, [concept, data]);

  const initializeHologram = () => {
    const particles = Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 400,
      y: (Math.random() - 0.5) * 400,
      z: (Math.random() - 0.5) * 400,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      vz: (Math.random() - 0.5) * 2,
      size: Math.random() * 5 + 2,
      color: `hsl(${Math.random() * 360}, 70%, 60%)`,
      energy: Math.random(),
      quantum: Math.random() > 0.7,
      connections: []
    }));

    // Create quantum entangled connections
    particles.forEach(particle => {
      if (particle.quantum) {
        const connections = particles
          .filter(p => p.id !== particle.id && Math.random() > 0.8)
          .slice(0, 3)
          .map(p => p.id);
        particle.connections = connections;
      }
    });

    setHologramState(prev => ({ ...prev, particles }));
  };

  const generateQuantumFields = () => {
    const fields = Array.from({ length: 5 }, (_, i) => ({
      id: i,
      type: ['electromagnetic', 'gravitational', 'strong', 'weak', 'higgs'][i],
      strength: Math.random() * 0.5 + 0.3,
      frequency: Math.random() * 0.1 + 0.05,
      phase: Math.random() * Math.PI * 2,
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][i]
    }));

    setHologramState(prev => ({ ...prev, quantumFields: fields }));
  };

  const startAIAnalysis = () => {
    const interval = setInterval(() => {
      const insights = [
        {
          type: 'pattern_recognition',
          confidence: Math.random() * 0.3 + 0.7,
          insight: 'Detected optimal learning pathway through quantum state analysis',
          recommendation: 'Focus on interconnected concepts for 23% better retention'
        },
        {
          type: 'cognitive_mapping',
          confidence: Math.random() * 0.2 + 0.8,
          insight: 'Neural pathway optimization detected in holographic representation',
          recommendation: 'Increase dimensional complexity for enhanced understanding'
        },
        {
          type: 'quantum_coherence',
          confidence: Math.random() * 0.4 + 0.6,
          insight: 'Quantum entanglement patterns suggest knowledge consolidation',
          recommendation: 'Maintain current visualization parameters for optimal learning'
        }
      ];

      setAiInsights(insights);
    }, 5000);

    return () => clearInterval(interval);
  };

  const renderHologram = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Clear with holographic background
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300);
    gradient.addColorStop(0, 'rgba(0, 20, 40, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Render quantum fields
    if (quantumMode) {
      hologramState.quantumFields.forEach(field => {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = field.color;
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 50; i++) {
          const angle = (i / 50) * Math.PI * 2;
          const radius = 100 + Math.sin(Date.now() * field.frequency + field.phase) * 50;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;
          
          if (i === 0) {
            ctx.beginPath();
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.restore();
      });
    }

    // Render particles with holographic effects
    hologramState.particles.forEach(particle => {
      const projected = project3D(particle, centerX, centerY);
      
      // Holographic glow effect
      if (isHolographic) {
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, particle.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.filter = 'blur(5px)';
        ctx.fill();
        ctx.restore();
      }

      // Main particle
      ctx.save();
      ctx.globalAlpha = particle.quantum ? 0.8 : 0.6;
      ctx.beginPath();
      ctx.arc(projected.x, projected.y, particle.size, 0, Math.PI * 2);
      
      if (particle.quantum) {
        const quantumGradient = ctx.createRadialGradient(
          projected.x, projected.y, 0,
          projected.x, projected.y, particle.size
        );
        quantumGradient.addColorStop(0, particle.color);
        quantumGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        ctx.fillStyle = quantumGradient;
      } else {
        ctx.fillStyle = particle.color;
      }
      
      ctx.fill();
      ctx.restore();

      // Quantum connections
      if (particle.quantum && quantumMode) {
        particle.connections.forEach(connId => {
          const connected = hologramState.particles.find(p => p.id === connId);
          if (connected) {
            const connProjected = project3D(connected, centerX, centerY);
            
            ctx.save();
            ctx.globalAlpha = 0.4;
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(projected.x, projected.y);
            ctx.lineTo(connProjected.x, connProjected.y);
            ctx.stroke();
            ctx.restore();
          }
        });
      }
    });

    // Holographic scan lines
    if (isHolographic) {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = '#00FFFF';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }
      ctx.restore();
    }
  };

  const project3D = (particle, centerX, centerY) => {
    const { rotation } = hologramState;
    
    // 3D rotation matrices
    const cosX = Math.cos(rotation.x);
    const sinX = Math.sin(rotation.x);
    const cosY = Math.cos(rotation.y);
    const sinY = Math.sin(rotation.y);
    const cosZ = Math.cos(rotation.z);
    const sinZ = Math.sin(rotation.z);

    // Apply rotations
    let x = particle.x;
    let y = particle.y * cosX - particle.z * sinX;
    let z = particle.y * sinX + particle.z * cosX;

    const tempX = x * cosY + z * sinY;
    z = -x * sinY + z * cosY;
    x = tempX;

    const finalX = x * cosZ - y * sinZ;
    const finalY = x * sinZ + y * cosZ;

    // Perspective projection
    const distance = 500;
    const scale = distance / (distance + z);

    return {
      x: centerX + finalX * scale,
      y: centerY + finalY * scale,
      scale
    };
  };

  const updateParticles = () => {
    setHologramState(prev => ({
      ...prev,
      particles: prev.particles.map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        z: particle.z + particle.vz,
        energy: Math.sin(Date.now() * 0.001 + particle.id) * 0.5 + 0.5
      })),
      rotation: {
        x: prev.rotation.x + 0.005,
        y: prev.rotation.y + 0.008,
        z: prev.rotation.z + 0.003
      }
    }));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      updateParticles();
      renderHologram();
    }, 50);

    return () => clearInterval(interval);
  }, [hologramState, isHolographic, quantumMode]);

  return (
    <div className="space-y-6">
      {/* Holographic Display */}
      <div className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 rounded-3xl p-8">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6 text-white">
            <div>
              <h2 className="text-3xl font-bold flex items-center">
                <Atom className="w-8 h-8 mr-3 animate-spin" />
                Holographic Learning Interface
              </h2>
              <p className="text-blue-200">Quantum-enhanced 3D concept visualization</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setIsHolographic(!isHolographic)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  isHolographic ? 'bg-cyan-500 text-white' : 'bg-white/20 text-cyan-200'
                }`}
              >
                <Eye className="w-4 h-4 mr-2 inline" />
                Holographic
              </button>
              <button
                onClick={() => setQuantumMode(!quantumMode)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  quantumMode ? 'bg-purple-500 text-white' : 'bg-white/20 text-purple-200'
                }`}
              >
                <Orbit className="w-4 h-4 mr-2 inline" />
                Quantum
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Holographic Display */}
            <div className="lg:col-span-2">
              <div className="relative bg-black/50 rounded-2xl p-4 border border-cyan-500/30">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={400}
                  className="w-full h-80 rounded-lg"
                />
                
                {/* Holographic UI Overlay */}
                <div className="absolute top-4 left-4 space-y-2">
                  <div className="bg-black/70 text-cyan-400 px-3 py-1 rounded text-sm font-mono">
                    PARTICLES: {hologramState.particles.length}
                  </div>
                  <div className="bg-black/70 text-cyan-400 px-3 py-1 rounded text-sm font-mono">
                    QUANTUM: {hologramState.particles.filter(p => p.quantum).length}
                  </div>
                  <div className="bg-black/70 text-cyan-400 px-3 py-1 rounded text-sm font-mono">
                    DIMENSIONS: {hologramState.dimensions}D
                  </div>
                </div>

                <div className="absolute bottom-4 right-4">
                  <div className="bg-black/70 text-green-400 px-3 py-1 rounded text-sm font-mono">
                    HOLOGRAM ACTIVE
                  </div>
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="space-y-4">
              <div className="bg-black/50 rounded-2xl p-4 border border-blue-500/30">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Cpu className="w-5 h-5 mr-2" />
                  Quantum Controls
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-blue-200 text-sm mb-2">Complexity</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={hologramState.complexity}
                      onChange={(e) => setHologramState(prev => ({
                        ...prev,
                        complexity: parseFloat(e.target.value)
                      }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-blue-200 text-sm mb-2">Dimensions</label>
                    <select
                      value={hologramState.dimensions}
                      onChange={(e) => setHologramState(prev => ({
                        ...prev,
                        dimensions: parseInt(e.target.value)
                      }))}
                      className="w-full bg-black/50 text-white border border-blue-500/30 rounded px-3 py-2"
                    >
                      <option value={2}>2D Projection</option>
                      <option value={3}>3D Hologram</option>
                      <option value={4}>4D Tesseract</option>
                      <option value={5}>5D Hypercube</option>
                    </select>
                  </div>

                  <button
                    onClick={initializeHologram}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg hover:shadow-lg transition-all"
                  >
                    <Sparkles className="w-4 h-4 mr-2 inline" />
                    Regenerate Hologram
                  </button>
                </div>
              </div>

              {/* Quantum Field Status */}
              <div className="bg-black/50 rounded-2xl p-4 border border-purple-500/30">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Layers className="w-5 h-5 mr-2" />
                  Quantum Fields
                </h3>
                
                <div className="space-y-3">
                  {hologramState.quantumFields.map(field => (
                    <div key={field.id} className="flex items-center justify-between">
                      <span className="text-sm text-gray-300 capitalize">{field.type}</span>
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: field.color }}
                        />
                        <span className="text-sm text-white">
                          {Math.round(field.strength * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <Zap className="w-6 h-6 mr-2 text-yellow-500" />
          Quantum AI Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map((insight, index) => (
            <div key={index} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-200">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                  {insight.type.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(insight.confidence * 100)}%
                </span>
              </div>
              <h4 className="font-semibold text-gray-800 mb-2">{insight.insight}</h4>
              <p className="text-sm text-gray-600">{insight.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HolographicVisualization;
