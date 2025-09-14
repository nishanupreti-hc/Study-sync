import asyncio
from typing import Dict, List, Any, Optional
import json
import random

class AIService:
    def __init__(self):
        self.subject_contexts = {
            "Python": "I'm your Python programming tutor. I'll help you learn Python from basics to advanced concepts.",
            "JavaScript": "I'm your JavaScript mentor. Let's explore web development and modern JS features together.",
            "Java": "I'm your Java instructor. I'll guide you through object-oriented programming and Java fundamentals.",
            "C++": "I'm your C++ guide. Let's master systems programming and advanced C++ concepts.",
            "HTML/CSS": "I'm your web design mentor. I'll teach you to create beautiful, responsive websites.",
            "SQL": "I'm your database expert. Let's learn to query and manage databases effectively."
        }
        
        self.conversation_history: Dict[str, List[Dict]] = {}
    
    async def process_message(self, message: str, subject: str = "General", user_id: str = "default") -> Dict[str, Any]:
        """Process user message and generate AI response"""
        
        # Initialize conversation history
        if user_id not in self.conversation_history:
            self.conversation_history[user_id] = []
        
        # Add user message to history
        self.conversation_history[user_id].append({
            "role": "user",
            "content": message,
            "timestamp": "now",
            "subject": subject
        })
        
        # Generate response based on subject and message
        response = await self._generate_response(message, subject, user_id)
        
        # Add AI response to history
        self.conversation_history[user_id].append({
            "role": "assistant",
            "content": response["content"],
            "timestamp": "now",
            "subject": subject
        })
        
        return response
    
    async def _generate_response(self, message: str, subject: str, user_id: str) -> Dict[str, Any]:
        """Generate AI response based on message and subject"""
        
        message_lower = message.lower()
        
        # Programming help responses
        if "error" in message_lower or "bug" in message_lower:
            return {
                "content": f"I see you're having trouble with an error. Let me help you debug this step by step:\n\n1. First, let's identify the exact error message\n2. Check the line number where the error occurs\n3. Look for common issues like syntax errors, typos, or logic problems\n\nCan you share the specific error message and your code?",
                "type": "debugging_help",
                "suggestions": ["Share your code", "Show error message", "Explain what you expected"]
            }
        
        elif "how to" in message_lower or "tutorial" in message_lower:
            return {
                "content": f"Great question! I'd love to create a step-by-step tutorial for you. Here's how we can approach this:\n\n📚 **Learning Path:**\n1. Start with the basics\n2. Practice with examples\n3. Build a small project\n4. Test your understanding\n\nWhat specific topic would you like to learn about in {subject}?",
                "type": "tutorial_request",
                "suggestions": ["Show examples", "Start with basics", "Give me a project idea"]
            }
        
        elif "example" in message_lower or "code" in message_lower:
            return await self._generate_code_example(subject, message)
        
        elif "quiz" in message_lower or "test" in message_lower:
            return await self._generate_quiz(subject)
        
        elif "project" in message_lower:
            return await self._suggest_project(subject)
        
        else:
            # General subject-specific response
            context = self.subject_contexts.get(subject, "I'm your AI programming mentor.")
            return {
                "content": f"{context}\n\nI understand you're asking about: {message}\n\nLet me help you with this topic. Would you like me to:\n- Provide a detailed explanation\n- Show you code examples\n- Create a practice exercise\n- Suggest related topics to explore",
                "type": "general_help",
                "suggestions": ["Explain in detail", "Show examples", "Give me practice", "Related topics"]
            }
    
    async def _generate_code_example(self, subject: str, message: str) -> Dict[str, Any]:
        """Generate code examples based on subject"""
        
        examples = {
            "Python": {
                "variables": '''# Python Variables Example
name = "Alice"
age = 25
height = 5.6
is_student = True

print(f"Name: {name}")
print(f"Age: {age}")
print(f"Height: {height}")
print(f"Is Student: {is_student}")''',
                
                "functions": '''# Python Functions Example
def greet(name, age):
    """Function to greet a person"""
    return f"Hello {name}! You are {age} years old."

def calculate_area(length, width):
    """Calculate rectangle area"""
    return length * width

# Using the functions
message = greet("Alice", 25)
area = calculate_area(10, 5)

print(message)
print(f"Area: {area}")''',
                
                "loops": '''# Python Loops Example
# For loop
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(f"I like {fruit}")

# While loop
count = 0
while count < 5:
    print(f"Count: {count}")
    count += 1

# List comprehension
squares = [x**2 for x in range(1, 6)]
print(f"Squares: {squares}")'''
            },
            
            "JavaScript": {
                "variables": '''// JavaScript Variables Example
let name = "Alice";
const age = 25;
var height = 5.6;
let isStudent = true;

console.log(`Name: ${name}`);
console.log(`Age: ${age}`);
console.log(`Height: ${height}`);
console.log(`Is Student: ${isStudent}`);''',
                
                "functions": '''// JavaScript Functions Example
function greet(name, age) {
    return `Hello ${name}! You are ${age} years old.`;
}

const calculateArea = (length, width) => {
    return length * width;
};

// Using the functions
const message = greet("Alice", 25);
const area = calculateArea(10, 5);

console.log(message);
console.log(`Area: ${area}`);''',
                
                "arrays": '''// JavaScript Arrays Example
const fruits = ["apple", "banana", "orange"];

// For loop
for (let i = 0; i < fruits.length; i++) {
    console.log(`I like ${fruits[i]}`);
}

// forEach method
fruits.forEach(fruit => {
    console.log(`I like ${fruit}`);
});

// Map method
const upperFruits = fruits.map(fruit => fruit.toUpperCase());
console.log(upperFruits);'''
            }
        }
        
        subject_examples = examples.get(subject, examples["Python"])
        example_key = random.choice(list(subject_examples.keys()))
        
        return {
            "content": f"Here's a {subject} code example for {example_key}:\n\n```{subject.lower()}\n{subject_examples[example_key]}\n```\n\n**Explanation:**\nThis example demonstrates {example_key} in {subject}. Try running this code and experiment with different values!",
            "type": "code_example",
            "code": subject_examples[example_key],
            "language": subject.lower(),
            "suggestions": ["Explain this code", "Show another example", "Give me practice"]
        }
    
    async def _generate_quiz(self, subject: str) -> Dict[str, Any]:
        """Generate a quiz question for the subject"""
        
        quizzes = {
            "Python": [
                {
                    "question": "What is the correct way to create a variable in Python?",
                    "options": ["var x = 5", "x = 5", "int x = 5", "x := 5"],
                    "correct": 1,
                    "explanation": "In Python, you create variables by simply assigning a value: x = 5"
                },
                {
                    "question": "Which of these is a Python data type?",
                    "options": ["string", "list", "dictionary", "All of the above"],
                    "correct": 3,
                    "explanation": "Python has many built-in data types including strings, lists, and dictionaries"
                }
            ],
            "JavaScript": [
                {
                    "question": "How do you declare a constant in JavaScript?",
                    "options": ["var x = 5", "let x = 5", "const x = 5", "constant x = 5"],
                    "correct": 2,
                    "explanation": "Use 'const' to declare constants in JavaScript: const x = 5"
                }
            ]
        }
        
        subject_quizzes = quizzes.get(subject, quizzes["Python"])
        quiz = random.choice(subject_quizzes)
        
        return {
            "content": f"🧠 **Quiz Time!**\n\n{quiz['question']}",
            "type": "quiz",
            "quiz_data": quiz,
            "suggestions": ["Answer A", "Answer B", "Answer C", "Answer D"]
        }
    
    async def _suggest_project(self, subject: str) -> Dict[str, Any]:
        """Suggest a project based on subject"""
        
        projects = {
            "Python": [
                {
                    "title": "Personal Expense Tracker",
                    "description": "Build a program to track daily expenses with categories and reporting",
                    "difficulty": "Beginner",
                    "skills": ["Variables", "Lists", "Functions", "File I/O"]
                },
                {
                    "title": "Weather App",
                    "description": "Create a weather application using APIs to fetch current weather data",
                    "difficulty": "Intermediate",
                    "skills": ["APIs", "JSON", "Error Handling", "User Interface"]
                }
            ],
            "JavaScript": [
                {
                    "title": "Interactive To-Do List",
                    "description": "Build a dynamic to-do list with add, edit, delete, and filter functionality",
                    "difficulty": "Beginner",
                    "skills": ["DOM Manipulation", "Event Listeners", "Local Storage"]
                }
            ]
        }
        
        subject_projects = projects.get(subject, projects["Python"])
        project = random.choice(subject_projects)
        
        return {
            "content": f"🚀 **Project Suggestion: {project['title']}**\n\n**Description:** {project['description']}\n\n**Difficulty:** {project['difficulty']}\n\n**Skills you'll learn:**\n" + "\n".join(f"• {skill}" for skill in project['skills']) + "\n\nWould you like me to help you get started with this project?",
            "type": "project_suggestion",
            "project_data": project,
            "suggestions": ["Start this project", "Show me steps", "Different project", "Help me plan"]
        }
