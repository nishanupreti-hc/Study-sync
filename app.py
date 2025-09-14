import streamlit as st
import numpy as np
import plotly.express as px

st.set_page_config(
    page_title="AI Programming Mentor",
    page_icon="🤖",
    layout="wide"
)

st.title("🤖 AI Programming Mentor")
st.markdown("### Complete Full-Stack Programming Learning Platform")

# Sidebar
with st.sidebar:
    st.header("Programming Courses")
    course = st.selectbox("Select Course", [
        "Python", "JavaScript", "Java", "C++", "HTML/CSS", "SQL"
    ])

# Main content
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader(f"{course} Course")
    
    if course == "Python":
        st.code("""
# Python Basics
def hello_world():
    print("Hello, World!")
    
hello_world()
        """, language="python")
    
    elif course == "JavaScript":
        st.code("""
// JavaScript Basics
function helloWorld() {
    console.log("Hello, World!");
}

helloWorld();
        """, language="javascript")
    
    # Chat interface
    st.subheader("AI Assistant")
    user_input = st.text_input("Ask me anything about programming:")
    
    if user_input:
        st.write(f"🤖 AI: I'd be happy to help you with {course} programming! Here's some guidance on: {user_input}")

with col2:
    st.subheader("Progress")
    
    # Sample progress data
    progress_data = {
        "Python": 75,
        "JavaScript": 60,
        "Java": 45,
        "C++": 30,
        "HTML/CSS": 80,
        "SQL": 55
    }
    
    fig = px.bar(
        x=list(progress_data.keys()),
        y=list(progress_data.values()),
        title="Learning Progress"
    )
    st.plotly_chart(fig, use_container_width=True)
    
    # Study stats
    st.metric("Study Hours", "24", "2")
    st.metric("Completed Lessons", "18", "3")
    st.metric("Quiz Score", "85%", "5%")

# Footer
st.markdown("---")
st.markdown("Built with ❤️ for personalized programming education")
