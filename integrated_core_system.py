import streamlit as st
import cv2
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from datetime import datetime, timedelta
import threading
import time
import json
import pandas as pd
from PIL import Image

# Import core AI processor
from core_ai_processor import (
    CoreAIProcessor, RAGModule, VectorDatabase, DiagramAnalyzer,
    SessionTimerManager, EngagementMonitor, AdaptiveLearningEngine,
    ModeSpecificGuidance, ARVisualizationEngine, ScenarioBasedLearning
)

class IntegratedCoreSystem:
    def __init__(self, api_key=None):
        self.core_ai = CoreAIProcessor(api_key)
        self.ar_engine = ARVisualizationEngine()
        self.scenario_engine = ScenarioBasedLearning()
        
        # Initialize session state
        self.current_session = None
        self.engagement_active = False
        self.ar_mode = False

def initialize_core_system():
    """Initialize the integrated core system"""
    if 'core_system' not in st.session_state:
        st.session_state.core_system = IntegratedCoreSystem()
    
    # Core system state variables
    core_vars = [
        'session_active', 'engagement_monitoring', 'ar_visualization',
        'adaptive_mode', 'current_mode', 'diagram_analysis_active'
    ]
    
    for var in core_vars:
        if var not in st.session_state:
            st.session_state[var] = False

def main():
    st.set_page_config(
        page_title="🧠 Integrated Core AI System - Nishan Upreti",
        layout="wide",
        initial_sidebar_state="expanded"
    )
    
    initialize_core_system()
    system = st.session_state.core_system
    
    # Core system CSS
    st.markdown("""
    <style>
    .core-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 2rem;
        border-radius: 15px;
        text-align: center;
        margin-bottom: 2rem;
    }
    .ai-panel {
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        color: white;
        padding: 1rem;
        border-radius: 10px;
        margin: 0.5rem 0;
    }
    .processing-indicator {
        display: inline-block;
        width: 12px;
        height: 12px;
        background: #4CAF50;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.7; transform: scale(1.1); }
        100% { opacity: 1; transform: scale(1); }
    }
    </style>
    """, unsafe_allow_html=True)
    
    # Core System Header
    st.markdown("""
    <div class="core-header">
        <h1>🧠 Integrated Core AI System</h1>
        <h2>Advanced Processing & Learning Engine</h2>
        <p>🤖 GPT-4/LLaMA • 🔍 RAG Module • 📊 Vector DB • 🎯 Adaptive Learning</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Core Control Sidebar
    with st.sidebar:
        st.title("🎛️ Core AI Controls")
        
        # LLM Configuration
        st.subheader("🤖 LLM Configuration")
        
        api_key = st.text_input("OpenAI API Key:", type="password", 
                               help="Enter your OpenAI API key for GPT-4 access")
        
        if api_key and api_key != st.session_state.get('api_key'):
            st.session_state.api_key = api_key
            system.core_ai = CoreAIProcessor(api_key)
            st.success("✅ LLM Connected!")
        
        model_choice = st.selectbox("Model:", ["GPT-4", "GPT-3.5-Turbo", "LLaMA-3"])
        
        # Mode Selection
        st.subheader("🎯 Learning Mode")
        
        current_mode = st.selectbox(
            "Select Mode:",
            ["study", "exam", "review", "project"],
            help="Choose learning mode for adaptive guidance"
        )
        st.session_state.current_mode = current_mode
        
        # Core Features Toggle
        st.subheader("⚡ Core Features")
        
        features = {
            "📊 RAG Module": "rag_active",
            "🔍 Vector Search": "vector_search",
            "📈 Engagement Monitor": "engagement_monitoring",
            "🎯 Adaptive Learning": "adaptive_mode",
            "🔬 AR Visualization": "ar_visualization",
            "📋 Diagram Analysis": "diagram_analysis_active"
        }
        
        for feature_name, state_key in features.items():
            st.session_state[state_key] = st.checkbox(feature_name, key=state_key)
        
        # Session Management
        st.subheader("⏱️ Session Management")
        
        timer_type = st.selectbox("Timer Type:", ["Pomodoro", "Custom"])
        
        if timer_type == "Custom":
            custom_duration = st.slider("Duration (minutes):", 5, 120, 25)
        else:
            custom_duration = None
        
        col1, col2 = st.columns(2)
        
        with col1:
            if st.button("▶️ Start Session"):
                session = system.core_ai.session_manager.start_session(
                    "main_session", 
                    timer_type.lower(), 
                    custom_duration
                )
                st.session_state.session_active = True
                st.success("Session started!")
        
        with col2:
            if st.button("⏸️ Pause Session"):
                system.core_ai.session_manager.pause_session("main_session")
                st.info("Session paused!")
        
        # Live Session Status
        if st.session_state.session_active:
            session_status = system.core_ai.session_manager.get_session_status("main_session")
            
            if session_status:
                remaining = session_status.get("remaining", 0)
                mins, secs = divmod(int(remaining), 60)
                
                st.metric("Time Remaining", f"{mins:02d}:{secs:02d}")
                st.progress(1 - (remaining / session_status.get("duration", 1)))
                
                if session_status.get("status") == "completed":
                    st.success("🎉 Session completed!")
                    st.balloons()
    
    # Main Content Tabs
    tabs = st.tabs([
        "🧠 AI Processing", "🔍 RAG & Vector DB", "📊 Engagement Monitor", 
        "🎯 Adaptive Learning", "🔬 AR Visualization", "📋 Scenario Learning"
    ])
    
    # AI Processing Tab
    with tabs[0]:
        st.header("🧠 Core AI Processing Engine")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Query Interface
            st.subheader("💬 AI Query Interface")
            
            query = st.text_area(
                "Ask your question:",
                height=100,
                placeholder="Enter your question about any subject..."
            )
            
            # Processing options
            col_a, col_b, col_c = st.columns(3)
            
            with col_a:
                if st.button("🤖 Process with AI"):
                    if query:
                        with st.spinner("Processing with AI..."):
                            response = system.core_ai.process_query(
                                query, 
                                mode=st.session_state.current_mode
                            )
                            
                            st.success("✅ AI Processing Complete!")
                            
                            # Display response
                            st.write("**AI Response:**")
                            st.write(response["response"])
                            
                            # Show mode guidance
                            if response.get("mode_guidance"):
                                with st.expander("🎯 Mode-Specific Guidance"):
                                    guidance = response["mode_guidance"]
                                    st.write(f"**Session Length:** {guidance['recommended_session_length']} minutes")
                                    st.write(f"**Break Interval:** {guidance['break_interval']} minutes")
                                    st.write(f"**Style:** {guidance['style']}")
                                    
                                    st.write("**Tips:**")
                                    for tip in guidance["tips"]:
                                        st.write(f"• {tip}")
            
            with col_b:
                if st.button("🔍 RAG Retrieval"):
                    if query and st.session_state.rag_active:
                        context = system.core_ai.rag_module.retrieve_context(query)
                        
                        st.write("**Retrieved Context:**")
                        for i, doc in enumerate(context):
                            with st.expander(f"Document {i+1}"):
                                st.write(doc)
            
            with col_c:
                if st.button("📊 Vector Search"):
                    if query and st.session_state.vector_search:
                        st.info("🔍 Vector search functionality active")
                        # Mock vector search results
                        st.write("**Similar Documents:**")
                        st.write("• Document 1 (similarity: 0.89)")
                        st.write("• Document 2 (similarity: 0.76)")
                        st.write("• Document 3 (similarity: 0.65)")
            
            # Document Ingestion
            st.subheader("📚 Document Ingestion")
            
            uploaded_files = st.file_uploader(
                "Upload documents for RAG:",
                type=['pdf', 'txt', 'docx'],
                accept_multiple_files=True
            )
            
            if uploaded_files:
                for file in uploaded_files:
                    with st.expander(f"📄 Processing: {file.name}"):
                        content = str(file.read(), 'utf-8') if file.type == 'text/plain' else "Document content"
                        
                        if st.button(f"📥 Ingest {file.name}", key=f"ingest_{file.name}"):
                            chunks = system.core_ai.rag_module.ingest_document(
                                content, 
                                {"filename": file.name, "upload_time": datetime.now().isoformat()}
                            )
                            st.success(f"✅ Ingested {chunks} chunks from {file.name}")
        
        with col2:
            # Processing Status
            st.markdown('<div class="ai-panel">', unsafe_allow_html=True)
            st.subheader("⚡ Processing Status")
            
            # Live indicators
            if st.session_state.get('api_key'):
                st.markdown('<span class="processing-indicator"></span> LLM Connected', unsafe_allow_html=True)
            else:
                st.warning("⚠️ LLM Not Connected")
            
            if st.session_state.rag_active:
                st.markdown('<span class="processing-indicator"></span> RAG Active', unsafe_allow_html=True)
            
            if st.session_state.vector_search:
                st.markdown('<span class="processing-indicator"></span> Vector DB Active', unsafe_allow_html=True)
            
            st.markdown('</div>', unsafe_allow_html=True)
            
            # Mode Guidance Display
            st.subheader("🎯 Current Mode Guidance")
            
            guidance = system.core_ai.mode_guidance.get_guidance(st.session_state.current_mode)
            
            st.metric("Recommended Session", f"{guidance['recommended_session_length']} min")
            st.metric("Break Interval", f"{guidance['break_interval']} min")
            
            st.write(f"**Style:** {guidance['style'].title()}")
            
            # Quick Tips
            st.write("**Quick Tips:**")
            for tip in guidance["tips"][:3]:
                st.info(f"💡 {tip}")
    
    # RAG & Vector DB Tab
    with tabs[1]:
        st.header("🔍 RAG Module & Vector Database")
        
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("📚 Knowledge Base")
            
            # RAG Statistics
            st.metric("Documents Indexed", "247")
            st.metric("Total Chunks", "1,523")
            st.metric("Vector Dimensions", "1,536")
            
            # Search Interface
            st.subheader("🔍 Semantic Search")
            
            search_query = st.text_input("Search knowledge base:")
            
            if st.button("🔍 Search") and search_query:
                results = system.core_ai.rag_module.retrieve_context(search_query, k=5)
                
                st.write("**Search Results:**")
                for i, result in enumerate(results):
                    with st.expander(f"Result {i+1}"):
                        st.write(result[:200] + "..." if len(result) > 200 else result)
            
            # Batch Upload
            st.subheader("📥 Batch Document Upload")
            
            if st.button("📚 Load Sample Documents"):
                sample_docs = [
                    "Physics: Newton's laws of motion describe the relationship between forces and motion.",
                    "Chemistry: The periodic table organizes elements by atomic number and properties.",
                    "Mathematics: Calculus deals with rates of change and accumulation of quantities."
                ]
                
                for i, doc in enumerate(sample_docs):
                    chunks = system.core_ai.rag_module.ingest_document(doc, {"source": f"sample_{i}"})
                    
                st.success(f"✅ Loaded {len(sample_docs)} sample documents")
        
        with col2:
            st.subheader("🗄️ Vector Database Status")
            
            # Database metrics
            db_metrics = {
                "ChromaDB Collections": 3,
                "FAISS Indices": 2,
                "Total Vectors": 1523,
                "Index Size": "45.2 MB"
            }
            
            for metric, value in db_metrics.items():
                st.metric(metric, value)
            
            # Database operations
            st.subheader("🔧 Database Operations")
            
            if st.button("🔄 Rebuild Index"):
                with st.spinner("Rebuilding vector index..."):
                    time.sleep(2)  # Simulate rebuild
                st.success("✅ Index rebuilt successfully!")
            
            if st.button("🧹 Clear Cache"):
                st.success("✅ Cache cleared!")
            
            if st.button("📊 Database Stats"):
                st.json({
                    "total_documents": 247,
                    "average_chunk_size": 856,
                    "embedding_model": "text-embedding-ada-002",
                    "last_updated": datetime.now().isoformat()
                })
    
    # Engagement Monitor Tab
    with tabs[2]:
        st.header("📊 Real-time Engagement Monitoring")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Camera feed simulation
            if st.session_state.engagement_monitoring:
                st.subheader("📹 Live Engagement Analysis")
                
                # Mock camera feed
                st.info("📹 Camera feed would appear here")
                
                # Simulate engagement analysis
                engagement_score = np.random.randint(70, 95)
                attention_level = np.random.choice(["High", "Medium", "Low"], p=[0.6, 0.3, 0.1])
                
                col_a, col_b, col_c = st.columns(3)
                
                with col_a:
                    st.metric("Engagement Score", f"{engagement_score}%")
                
                with col_b:
                    st.metric("Attention Level", attention_level)
                
                with col_c:
                    st.metric("Focus Duration", "12 min")
                
                # Engagement trend chart
                st.subheader("📈 Engagement Trend")
                
                # Generate mock data
                times = pd.date_range('now', periods=20, freq='1min')
                scores = np.random.randint(60, 100, 20)
                
                engagement_df = pd.DataFrame({
                    'Time': times,
                    'Engagement': scores
                })
                
                fig = px.line(engagement_df, x='Time', y='Engagement', 
                             title='Real-time Engagement Tracking')
                fig.add_hline(y=70, line_dash="dash", line_color="orange", 
                             annotation_text="Target Level")
                
                st.plotly_chart(fig, use_container_width=True)
                
                # Alerts and suggestions
                if engagement_score < 70:
                    st.warning("⚠️ Low engagement detected! Consider taking a break.")
                elif engagement_score > 90:
                    st.success("🎉 Excellent focus! Keep up the great work!")
            
            else:
                st.info("Enable engagement monitoring in the sidebar to start tracking")
        
        with col2:
            # Engagement controls
            st.subheader("🎛️ Monitoring Controls")
            
            if st.button("📹 Start Camera"):
                st.session_state.engagement_monitoring = True
                st.success("Camera monitoring started!")
            
            if st.button("⏹️ Stop Monitoring"):
                st.session_state.engagement_monitoring = False
                st.info("Monitoring stopped!")
            
            # Engagement settings
            st.subheader("⚙️ Settings")
            
            alert_threshold = st.slider("Alert Threshold:", 30, 90, 70)
            monitoring_interval = st.slider("Check Interval (sec):", 1, 10, 3)
            
            # Recent alerts
            st.subheader("🚨 Recent Alerts")
            
            alerts = [
                {"time": "14:23", "type": "Low Focus", "action": "Break suggested"},
                {"time": "14:15", "type": "Good Progress", "action": "Keep going"},
                {"time": "14:08", "type": "Distraction", "action": "Refocus needed"}
            ]
            
            for alert in alerts:
                alert_color = "🔴" if "Low" in alert["type"] else "🟢" if "Good" in alert["type"] else "🟡"
                st.write(f"{alert_color} {alert['time']} - {alert['type']}: {alert['action']}")
    
    # Continue with remaining tabs...
    # [Additional tabs would be implemented with similar core system integration]

if __name__ == "__main__":
    main()
