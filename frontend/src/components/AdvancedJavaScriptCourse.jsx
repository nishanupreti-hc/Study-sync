import React, { useState } from 'react';
import { Play, Code, BookOpen, Video, ExternalLink, CheckCircle } from 'lucide-react';

const AdvancedJavaScriptCourse = () => {
  const [activeLesson, setActiveLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());

  const jsCourse = [
    {
      title: "JavaScript Introduction",
      content: `JavaScript is the world's most popular programming language.

JavaScript is used for:
• Web development (client-side and server-side)
• Mobile app development
• Desktop applications
• Game development

JavaScript Features:
• Dynamic typing
• First-class functions
• Prototype-based object-oriented programming
• Event-driven programming`,
      code: `// JavaScript basics
console.log("Hello, World!");

// Variables
let name = "JavaScript";
const version = "ES2023";
var isAwesome = true;

console.log(\`Welcome to \${name} \${version}!\`);

// Functions
function greet(name) {
    return \`Hello, \${name}!\`;
}

console.log(greet("Developer"));`,
      videoId: "PkZNo7MFNFg", // JavaScript Crash Course
      exercises: [
        { question: "How do you declare a variable in JavaScript?", answer: "let, const, or var" },
        { question: "What is the difference between let and const?", answer: "const cannot be reassigned" }
      ]
    },
    {
      title: "JavaScript Variables & Data Types",
      content: `JavaScript has dynamic types. Variables can hold different data types.

Primitive Data Types:
• String - text data
• Number - integers and floats
• Boolean - true/false
• Undefined - declared but not assigned
• Null - intentional absence of value
• Symbol - unique identifier
• BigInt - large integers

Non-primitive:
• Object - collections of key-value pairs
• Array - ordered lists
• Function - reusable code blocks`,
      code: `// Data types
let text = "Hello World";        // String
let number = 42;                 // Number
let decimal = 3.14;              // Number
let isTrue = true;               // Boolean
let notDefined;                  // Undefined
let empty = null;                // Null

// Arrays
let fruits = ["apple", "banana", "orange"];
console.log(fruits[0]);

// Objects
let person = {
    name: "John",
    age: 30,
    city: "New York"
};
console.log(person.name);

// Type checking
console.log(typeof text);
console.log(typeof number);
console.log(typeof isTrue);`,
      videoId: "hdI2bqOjy3c",
      exercises: [
        { question: "What does typeof operator do?", answer: "Returns the type of a variable" },
        { question: "How do you access object properties?", answer: "dot notation or bracket notation" }
      ]
    },
    {
      title: "JavaScript Functions",
      content: `Functions are reusable blocks of code that perform specific tasks.

Function Types:
• Function declarations
• Function expressions
• Arrow functions
• Anonymous functions
• IIFE (Immediately Invoked Function Expression)

Function Features:
• Parameters and arguments
• Return values
• Scope and closures
• Higher-order functions`,
      code: `// Function declaration
function add(a, b) {
    return a + b;
}

// Function expression
const multiply = function(a, b) {
    return a * b;
};

// Arrow function
const divide = (a, b) => a / b;

// Arrow function with block
const greet = (name) => {
    const message = \`Hello, \${name}!\`;
    return message;
};

console.log(add(5, 3));
console.log(multiply(4, 2));
console.log(divide(10, 2));
console.log(greet("Alice"));

// Higher-order function
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log(doubled);`,
      videoId: "N8ap4k_1QEQ",
      exercises: [
        { question: "What is an arrow function?", answer: "A shorter way to write functions using =>" },
        { question: "What does the map() method do?", answer: "Creates a new array with transformed elements" }
      ]
    },
    {
      title: "JavaScript Arrays",
      content: `Arrays are ordered collections of items. JavaScript arrays are dynamic and can hold mixed data types.

Array Methods:
• push() - add to end
• pop() - remove from end
• shift() - remove from beginning
• unshift() - add to beginning
• slice() - extract portion
• splice() - modify array
• forEach() - iterate
• map() - transform elements
• filter() - select elements
• reduce() - accumulate values`,
      code: `// Creating arrays
let fruits = ["apple", "banana", "cherry"];
let numbers = [1, 2, 3, 4, 5];
let mixed = ["hello", 42, true, null];

console.log(fruits.length);

// Adding elements
fruits.push("orange");
fruits.unshift("grape");
console.log(fruits);

// Removing elements
let lastFruit = fruits.pop();
let firstFruit = fruits.shift();
console.log(lastFruit, firstFruit);

// Array methods
let doubled = numbers.map(n => n * 2);
let evens = numbers.filter(n => n % 2 === 0);
let sum = numbers.reduce((acc, n) => acc + n, 0);

console.log("Doubled:", doubled);
console.log("Evens:", evens);
console.log("Sum:", sum);

// Array destructuring
let [first, second, ...rest] = fruits;
console.log(first, second, rest);`,
      videoId: "7W4pQQ20nJg",
      exercises: [
        { question: "How do you add an element to the end of an array?", answer: "push() method" },
        { question: "What does filter() method return?", answer: "A new array with elements that pass the test" }
      ]
    },
    {
      title: "JavaScript Objects & DOM",
      content: `Objects are collections of key-value pairs. The DOM (Document Object Model) represents the HTML document structure.

Object Features:
• Properties and methods
• Object literals
• Constructor functions
• Classes (ES6+)
• Prototypes

DOM Manipulation:
• Selecting elements
• Modifying content
• Changing styles
• Event handling
• Creating elements`,
      code: `// Object literal
let car = {
    brand: "Toyota",
    model: "Camry",
    year: 2023,
    start: function() {
        console.log("Car started!");
    }
};

console.log(car.brand);
car.start();

// Constructor function
function Person(name, age) {
    this.name = name;
    this.age = age;
    this.greet = function() {
        return \`Hi, I'm \${this.name}\`;
    };
}

let person1 = new Person("Alice", 25);
console.log(person1.greet());

// ES6 Class
class Animal {
    constructor(name, species) {
        this.name = name;
        this.species = species;
    }
    
    speak() {
        return \`\${this.name} makes a sound\`;
    }
}

let dog = new Animal("Buddy", "Dog");
console.log(dog.speak());

// DOM manipulation (in browser)
// document.getElementById("myElement").innerHTML = "New content";
// document.querySelector(".myClass").style.color = "red";`,
      videoId: "EfAl9bwzVZk",
      exercises: [
        { question: "How do you create an object in JavaScript?", answer: "Object literal {} or constructor function" },
        { question: "What is the DOM?", answer: "Document Object Model - represents HTML structure" }
      ]
    }
  ];

  const markComplete = (index) => {
    setCompletedLessons(prev => new Set([...prev, index]));
  };

  const currentLesson = jsCourse[activeLesson];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Course Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
            <h3 className="font-bold text-lg mb-4 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-yellow-600" />
              JavaScript Course
            </h3>
            <div className="space-y-2">
              {jsCourse.map((lesson, index) => (
                <button
                  key={index}
                  onClick={() => setActiveLesson(index)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    activeLesson === index 
                      ? 'bg-yellow-100 border-l-4 border-yellow-500' 
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
            
            <div className="mt-6 p-3 bg-yellow-50 rounded-lg">
              <div className="text-sm text-yellow-800">
                Progress: {completedLessons.size}/{jsCourse.length} lessons
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${(completedLessons.size / jsCourse.length) * 100}%` }}
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
                Lesson {activeLesson + 1} of {jsCourse.length}
              </span>
              <button
                onClick={() => markComplete(activeLesson)}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  completedLessons.has(activeLesson)
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
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
              <Code className="w-5 h-5 mr-2 text-yellow-600" />
              Try it Yourself
            </h3>
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <pre className="text-yellow-400 text-sm">
                <code>{currentLesson.code}</code>
              </pre>
            </div>
            <div className="mt-4 flex space-x-2">
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center">
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
                    <summary className="cursor-pointer text-yellow-600 hover:text-yellow-800">
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
              onClick={() => setActiveLesson(Math.min(jsCourse.length - 1, activeLesson + 1))}
              disabled={activeLesson === jsCourse.length - 1}
              className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedJavaScriptCourse;
