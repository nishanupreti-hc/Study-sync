import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, Brain, MessageCircle, Sparkles } from 'lucide-react';

const AIVoiceInterface = ({ onCommand, language = 'en' }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [voiceWaveform, setVoiceWaveform] = useState([]);
  const [emotionalState, setEmotionalState] = useState('neutral');
  const [confidence, setConfidence] = useState(0);
  const [aiPersonality, setAiPersonality] = useState('friendly');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  const languages = {
    en: { name: 'English', voice: 'en-US' },
    es: { name: 'Spanish', voice: 'es-ES' },
    fr: { name: 'French', voice: 'fr-FR' },
    de: { name: 'German', voice: 'de-DE' },
    ja: { name: 'Japanese', voice: 'ja-JP' },
    zh: { name: 'Chinese', voice: 'zh-CN' },
    hi: { name: 'Hindi', voice: 'hi-IN' },
    ar: { name: 'Arabic', voice: 'ar-SA' }
  };

  const personalities = {
    friendly: {
      name: 'Friendly Tutor',
      style: 'encouraging and supportive',
      responses: {
        greeting: "Hello! I'm excited to help you learn today! What would you like to explore?",
        encouragement: "You're doing great! Keep up the excellent work!",
        explanation: "Let me break this down in a simple way for you."
      }
    },
    professional: {
      name: 'Professional Instructor',
      style: 'formal and structured',
      responses: {
        greeting: "Good day. I am your AI learning assistant. How may I assist your studies today?",
        encouragement: "Your progress is commendable. Continue with this approach.",
        explanation: "Allow me to provide a comprehensive explanation of this concept."
      }
    },
    enthusiastic: {
      name: 'Enthusiastic Mentor',
      style: 'energetic and motivating',
      responses: {
        greeting: "Hey there, superstar! Ready to unlock some amazing knowledge today?",
        encouragement: "Wow! You're absolutely crushing it! This is fantastic!",
        explanation: "Oh, this is such a cool concept! Let me show you why it's amazing!"
      }
    },
    zen: {
      name: 'Zen Master',
      style: 'calm and philosophical',
      responses: {
        greeting: "Welcome, young learner. The path to knowledge begins with a single step.",
        encouragement: "Like a river flowing to the sea, your understanding grows naturally.",
        explanation: "Consider this concept as a gentle breeze that carries wisdom."
      }
    }
  };

  useEffect(() => {
    initializeVoiceRecognition();
    initializeAudioAnalysis();
    return () => cleanup();
  }, [language]);

  const initializeVoiceRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = languages[language].voice;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        startWaveformVisualization();
      };

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            setConfidence(confidence);
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
        
        if (finalTranscript) {
          processVoiceCommand(finalTranscript, confidence);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  };

  const initializeAudioAnalysis = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
    } catch (error) {
      console.error('Audio analysis initialization failed:', error);
    }
  };

  const startWaveformVisualization = () => {
    const updateWaveform = () => {
      if (analyserRef.current && isListening) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        const waveform = Array.from(dataArray).slice(0, 50).map(value => value / 255);
        setVoiceWaveform(waveform);
        
        requestAnimationFrame(updateWaveform);
      }
    };
    updateWaveform();
  };

  const processVoiceCommand = async (command, confidence) => {
    // Analyze emotional tone
    const emotion = analyzeEmotionalTone(command);
    setEmotionalState(emotion);

    // Generate AI response
    const response = await generateAIResponse(command, emotion, confidence);
    setAiResponse(response);

    // Speak the response
    speakResponse(response);

    // Execute command
    onCommand?.({ command, emotion, confidence, response });
  };

  const analyzeEmotionalTone = (text) => {
    const emotions = {
      frustrated: ['difficult', 'hard', 'confused', 'stuck', 'help', 'don\'t understand'],
      excited: ['awesome', 'great', 'amazing', 'love', 'fantastic', 'cool'],
      curious: ['why', 'how', 'what', 'explain', 'tell me', 'show me'],
      confident: ['know', 'understand', 'got it', 'clear', 'easy', 'simple'],
      tired: ['tired', 'exhausted', 'break', 'stop', 'enough', 'later']
    };

    const lowerText = text.toLowerCase();
    
    for (const [emotion, keywords] of Object.entries(emotions)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return emotion;
      }
    }
    
    return 'neutral';
  };

  const generateAIResponse = async (command, emotion, confidence) => {
    const personality = personalities[aiPersonality];
    
    // Simulate advanced NLP processing
    await new Promise(resolve => setTimeout(resolve, 500));

    if (command.toLowerCase().includes('hello') || command.toLowerCase().includes('hi')) {
      return personality.responses.greeting;
    }

    if (emotion === 'frustrated') {
      return "I understand this can be challenging. Let's break it down into smaller, manageable steps. You've got this!";
    }

    if (emotion === 'excited') {
      return personality.responses.encouragement;
    }

    if (command.toLowerCase().includes('explain') || command.toLowerCase().includes('what is')) {
      return personality.responses.explanation;
    }

    if (confidence < 0.7) {
      return "I'm not entirely sure I understood that correctly. Could you please repeat or rephrase your question?";
    }

    // Default intelligent response
    return `I heard you say "${command}". Based on your ${emotion} tone, I'll provide a ${personality.style} response to help you learn effectively.`;
  };

  const speakResponse = (text) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = languages[language].voice;
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      // Adjust voice based on personality
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(language) && 
        (aiPersonality === 'friendly' ? voice.name.includes('Female') : voice.name.includes('Male'))
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      speechSynthesis.speak(utterance);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const cleanup = () => {
    recognitionRef.current?.stop();
    speechSynthesis.cancel();
    audioContextRef.current?.close();
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      neutral: 'from-gray-500 to-gray-600',
      excited: 'from-yellow-500 to-orange-500',
      frustrated: 'from-red-500 to-pink-500',
      curious: 'from-blue-500 to-purple-500',
      confident: 'from-green-500 to-teal-500',
      tired: 'from-indigo-500 to-blue-500'
    };
    return colors[emotion] || colors.neutral;
  };

  return (
    <div className="space-y-6">
      {/* Main Voice Interface */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 rounded-3xl p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold flex items-center">
                <Brain className="w-8 h-8 mr-3 animate-pulse" />
                AI Voice Assistant
              </h2>
              <p className="text-indigo-200">Natural language learning companion with emotional intelligence</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-black/30 text-white border border-white/20 rounded-lg px-3 py-2"
              >
                {Object.entries(languages).map(([code, lang]) => (
                  <option key={code} value={code} className="bg-gray-800">
                    {lang.name}
                  </option>
                ))}
              </select>
              <select
                value={aiPersonality}
                onChange={(e) => setAiPersonality(e.target.value)}
                className="bg-black/30 text-white border border-white/20 rounded-lg px-3 py-2"
              >
                {Object.entries(personalities).map(([key, personality]) => (
                  <option key={key} value={key} className="bg-gray-800">
                    {personality.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Voice Controls */}
            <div className="lg:col-span-2">
              <div className="bg-black/30 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-center space-x-8 mb-6">
                  <button
                    onClick={toggleListening}
                    className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                        : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    {isListening && (
                      <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping"></div>
                    )}
                  </button>

                  <button
                    onClick={stopSpeaking}
                    disabled={!isSpeaking}
                    className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                      isSpeaking 
                        ? 'bg-orange-500 hover:bg-orange-600' 
                        : 'bg-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {isSpeaking ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                  </button>
                </div>

                {/* Voice Waveform */}
                <div className="h-20 bg-black/20 rounded-lg flex items-end justify-center space-x-1 p-2">
                  {voiceWaveform.map((amplitude, index) => (
                    <div
                      key={index}
                      className="bg-cyan-400 rounded-t transition-all duration-100"
                      style={{ 
                        height: `${Math.max(amplitude * 60, 2)}px`,
                        width: '4px'
                      }}
                    />
                  ))}
                  {voiceWaveform.length === 0 && (
                    <div className="text-cyan-400 text-sm">
                      {isListening ? 'Listening...' : 'Click microphone to start'}
                    </div>
                  )}
                </div>
              </div>

              {/* Conversation Display */}
              <div className="bg-black/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4 flex items-center">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Conversation
                </h3>
                
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {transcript && (
                    <div className="bg-blue-500/20 rounded-lg p-3">
                      <div className="text-sm text-blue-200 mb-1">You said:</div>
                      <div className="text-white">{transcript}</div>
                      <div className="text-xs text-blue-300 mt-1">
                        Confidence: {Math.round(confidence * 100)}%
                      </div>
                    </div>
                  )}
                  
                  {aiResponse && (
                    <div className="bg-purple-500/20 rounded-lg p-3">
                      <div className="text-sm text-purple-200 mb-1 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Response:
                      </div>
                      <div className="text-white">{aiResponse}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Emotional Analysis */}
            <div className="space-y-6">
              <div className="bg-black/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Emotional State</h3>
                
                <div className="text-center mb-4">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r ${getEmotionColor(emotionalState)} text-white font-medium`}>
                    {emotionalState.charAt(0).toUpperCase() + emotionalState.slice(1)}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Confidence</span>
                    <span>{Math.round(confidence * 100)}%</span>
                  </div>
                  <div className="w-full bg-black/20 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">AI Personality</h3>
                <div className="text-center">
                  <div className="text-lg font-medium mb-2">
                    {personalities[aiPersonality].name}
                  </div>
                  <div className="text-sm text-gray-300">
                    {personalities[aiPersonality].style}
                  </div>
                </div>
              </div>

              <div className="bg-black/30 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">Voice Commands</h3>
                <div className="space-y-2 text-sm">
                  <div>"Explain [topic]" - Get detailed explanations</div>
                  <div>"Quiz me on [subject]" - Start interactive quiz</div>
                  <div>"Show me examples" - View code examples</div>
                  <div>"I'm confused" - Get simplified explanation</div>
                  <div>"Take a break" - Pause learning session</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIVoiceInterface;
