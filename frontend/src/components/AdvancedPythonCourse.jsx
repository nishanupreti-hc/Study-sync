import React, { useState } from 'react';
import { Play, Code, BookOpen, Video, ExternalLink, CheckCircle } from 'lucide-react';

const AdvancedPythonCourse = () => {
  const [activeLesson, setActiveLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  const pythonCourse = [
    {
      title: "Python Introduction",
      content: `Python is a popular programming language. It was created by Guido van Rossum, and released in 1991.

It is used for:
• Web development (server-side)
• Software development
• Mathematics
• System scripting`,
      code: `print("Hello, World!")
# This is a comment
name = "Python"
print(f"Welcome to {name} programming!")`,
      videoId: "kqtD5dpn9C8", // Python tutorial video
      exercises: [
        { question: "What does print() function do?", answer: "Displays output to console" },
        { question: "How do you create a comment in Python?", answer: "Use # symbol" }
      ]
    },
    {
      title: "Python Variables",
      content: `Variables are containers for storing data values.

Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.

Variable Rules:
• Must start with a letter or underscore
• Cannot start with a number
• Can only contain alpha-numeric characters and underscores
• Case-sensitive`,
      code: `# Creating variables
x = 5
y = "John"
print(x)
print(y)

# Multiple assignment
a, b, c = "Orange", "Banana", "Cherry"
print(a, b, c)

# Global variables
x = "awesome"
def myfunc():
    print("Python is " + x)
myfunc()`,
      videoId: "cQT33yu9pY8",
      exercises: [
        { question: "Create a variable named 'age' with value 25", answer: "age = 25" },
        { question: "What is the output of: x = 5; print(type(x))", answer: "<class 'int'>" }
      ]
    },
    {
      title: "Python Data Types",
      content: `Python has the following data types built-in by default:

Text Type: str
Numeric Types: int, float, complex
Sequence Types: list, tuple, range
Mapping Type: dict
Set Types: set, frozenset
Boolean Type: bool
Binary Types: bytes, bytearray, memoryview`,
      code: `# Different data types
x = "Hello World"    # str
y = 20               # int
z = 20.5             # float
a = 1j               # complex
b = ["apple", "banana", "cherry"]  # list
c = ("apple", "banana", "cherry")  # tuple
d = range(6)         # range
e = {"name": "John", "age": 36}    # dict
f = {"apple", "banana", "cherry"}  # set
g = True             # bool

print(type(x))
print(type(y))
print(type(z))`,
      videoId: "gCCVHqjjUFw",
      exercises: [
        { question: "What type is [1, 2, 3]?", answer: "list" },
        { question: "How to check the type of a variable?", answer: "type() function" }
      ]
    },
    {
      title: "Python Lists",
      content: `Lists are used to store multiple items in a single variable.

Lists are one of 4 built-in data types in Python used to store collections of data.

List characteristics:
• Ordered - items have a defined order
• Changeable - we can change, add, and remove items
• Allow duplicates - can have items with the same value`,
      code: `# Creating lists
thislist = ["apple", "banana", "cherry"]
print(thislist)

# List length
print(len(thislist))

# Access items
print(thislist[0])  # First item
print(thislist[-1]) # Last item

# Change items
thislist[1] = "blackcurrant"
print(thislist)

# Add items
thislist.append("orange")
thislist.insert(1, "watermelon")
print(thislist)

# Remove items
thislist.remove("banana")
thislist.pop(1)
del thislist[0]
print(thislist)`,
      videoId: "ohCDWZgNIU0",
      exercises: [
        { question: "How to add an item to the end of a list?", answer: "append() method" },
        { question: "How to access the last item in a list?", answer: "list[-1]" }
      ]
    },
    {
      title: "Python Functions",
      content: `A function is a block of code which only runs when it is called.

You can pass data, known as parameters, into a function.

A function can return data as a result.

Function benefits:
• Code reusability
• Better organization
• Easier debugging
• Modular programming`,
      code: `# Basic function
def my_function():
    print("Hello from a function")

my_function()

# Function with parameters
def greet(name):
    print(f"Hello, {name}!")

greet("Alice")

# Function with return value
def add_numbers(x, y):
    return x + y

result = add_numbers(5, 3)
print(result)

# Function with default parameter
def greet_with_title(name, title="Mr."):
    return f"Hello, {title} {name}!"

print(greet_with_title("Smith"))
print(greet_with_title("Johnson", "Dr."))`,
      videoId: "9Os0o3wzS_I",
      exercises: [
        { question: "How to define a function in Python?", answer: "def function_name():" },
        { question: "What keyword is used to return a value?", answer: "return" }
      ]
    }
  ];

  const markComplete = (index) => {
    setCompletedLessons(prev => new Set([...prev, index]));
  };

  const currentLesson = pythonCourse[activeLesson];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Course Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Python Course
            </h3>
            <div className="space-y-2">
              {pythonCourse.map((lesson, index) => (
                <button
                  key={index}
                  onClick={() => setActiveLesson(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeLesson === index 
                      ? 'bg-blue-100 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{lesson.title}</span>
                    {completedLessons.has(index) && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-green-800">
                Progress: {completedLessons.size}/{pythonCourse.length} lessons
              </div>
              <div className="w-full bg-green-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(completedLessons.size / pythonCourse.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Lesson Header */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {currentLesson.title}
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Lesson {activeLesson + 1} of {pythonCourse.length}
              </span>
              <button
                onClick={() => markComplete(activeLesson)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  completedLessons.has(activeLesson)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {completedLessons.has(activeLesson) ? 'Completed' : 'Mark Complete'}
              </button>
            </div>
          </div>

          {/* Video Tutorial */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Video className="w-5 h-5 mr-2 text-red-600" />
              Video Tutorial
            </h3>
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${currentLesson.videoId}`}
                title={currentLesson.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* Lesson Content */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Lesson Content</h3>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {currentLesson.content}
              </pre>
            </div>
          </div>

          {/* Code Example */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2 text-green-600" />
              Try it Yourself
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-green-400 text-sm">
                <code>{currentLesson.code}</code>
              </pre>
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center">
                <Play className="w-4 h-4 mr-2" />
                Run Code
              </button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in Editor
              </button>
            </div>
          </div>

          {/* Exercises */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Practice Exercises</h3>
            <div className="space-y-4">
              {currentLesson.exercises.map((exercise, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="font-medium text-gray-800 mb-2">
                    Q{index + 1}: {exercise.question}
                  </div>
                  <details className="text-sm text-gray-600">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                      Show Answer
                    </summary>
                    <div className="mt-2 p-2 bg-gray-50 rounded">
                      {exercise.answer}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={() => setActiveLesson(Math.max(0, activeLesson - 1))}
              disabled={activeLesson === 0}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous Lesson
            </button>
            <button
              onClick={() => setActiveLesson(Math.min(pythonCourse.length - 1, activeLesson + 1))}
              disabled={activeLesson === pythonCourse.length - 1}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedPythonCourse;
