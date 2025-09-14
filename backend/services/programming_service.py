import asyncio
from typing import Dict, List, Any

class ProgrammingService:
    def __init__(self):
        self.course_content = {
            "Python": {
                "basics": {
                    "title": "Python Basics",
                    "lessons": [
                        {
                            "id": 1,
                            "title": "Python Introduction",
                            "content": """
# Python Introduction

Python is a popular programming language. It was created by Guido van Rossum, and released in 1991.

## What can Python do?
- Python can be used on a server to create web applications
- Python can be used alongside software to create workflows
- Python can connect to database systems
- Python can handle big data and perform complex mathematics
- Python can be used for rapid prototyping, or for production-ready software development

## Python Syntax compared to other programming languages
- Python was designed for readability, and has some similarities to the English language
- Python uses new lines to complete a command, as opposed to other programming languages which often use semicolons or parentheses
- Python relies on indentation, using whitespace, to define scope

## Example:
```python
print("Hello, World!")
```
                            """,
                            "code_example": 'print("Hello, World!")',
                            "quiz": [
                                {
                                    "question": "What is Python?",
                                    "options": ["A snake", "A programming language", "A game", "A movie"],
                                    "correct": 1
                                }
                            ]
                        },
                        {
                            "id": 2,
                            "title": "Python Variables",
                            "content": """
# Python Variables

Variables are containers for storing data values.

## Creating Variables
Python has no command for declaring a variable. A variable is created the moment you first assign a value to it.

```python
x = 5
y = "John"
print(x)
print(y)
```

## Variable Names
- A variable name must start with a letter or the underscore character
- A variable name cannot start with a number
- A variable name can only contain alpha-numeric characters and underscores (A-z, 0-9, and _ )
- Variable names are case-sensitive (age, Age and AGE are three different variables)

## Example:
```python
myvar = "John"
my_var = "John"
_my_var = "John"
myVar = "John"
MYVAR = "John"
myvar2 = "John"
```
                            """,
                            "code_example": '''x = 5\ny = "Hello"\nprint(x)\nprint(y)''',
                            "quiz": [
                                {
                                    "question": "Which is a valid variable name?",
                                    "options": ["2myvar", "my-var", "my_var", "my var"],
                                    "correct": 2
                                }
                            ]
                        }
                    ]
                },
                "data_types": {
                    "title": "Python Data Types",
                    "lessons": [
                        {
                            "id": 3,
                            "title": "Python Data Types",
                            "content": """
# Python Data Types

In programming, data type is an important concept. Variables can store data of different types.

## Built-in Data Types
Python has the following data types built-in by default:

**Text Type:** str
**Numeric Types:** int, float, complex
**Sequence Types:** list, tuple, range
**Mapping Type:** dict
**Set Types:** set, frozenset
**Boolean Type:** bool
**Binary Types:** bytes, bytearray, memoryview

## Getting the Data Type
You can get the data type of any object by using the type() function:

```python
x = 5
print(type(x))
```

## Examples:
```python
x = "Hello World"    # str
x = 20               # int
x = 20.5             # float
x = 1j               # complex
x = ["apple", "banana", "cherry"]  # list
x = ("apple", "banana", "cherry")  # tuple
x = {"name" : "John", "age" : 36}  # dict
x = True             # bool
```
                            """,
                            "code_example": '''x = 5\nprint(type(x))\ny = "Hello"\nprint(type(y))''',
                            "quiz": [
                                {
                                    "question": "What data type is the value 3.14?",
                                    "options": ["int", "float", "str", "bool"],
                                    "correct": 1
                                }
                            ]
                        }
                    ]
                }
            },
            "JavaScript": {
                "basics": {
                    "title": "JavaScript Basics",
                    "lessons": [
                        {
                            "id": 1,
                            "title": "JavaScript Introduction",
                            "content": """
# JavaScript Introduction

JavaScript is the world's most popular programming language.
JavaScript is the programming language of the Web.

## What can JavaScript do?
- JavaScript can change HTML content
- JavaScript can change HTML attribute values
- JavaScript can change HTML styles (CSS)
- JavaScript can hide HTML elements
- JavaScript can show HTML elements

## Example:
```javascript
document.getElementById("demo").innerHTML = "Hello JavaScript";
```

## JavaScript Can Change HTML Content
One of many JavaScript HTML methods is getElementById().
The example below "finds" an HTML element (with id="demo"), and changes the element content (innerHTML) to "Hello JavaScript":

```javascript
document.getElementById("demo").innerHTML = "Hello JavaScript";
```
                            """,
                            "code_example": 'console.log("Hello, World!");',
                            "quiz": [
                                {
                                    "question": "What is JavaScript primarily used for?",
                                    "options": ["Desktop applications", "Web development", "Mobile apps", "Games"],
                                    "correct": 1
                                }
                            ]
                        }
                    ]
                }
            },
            "Java": {
                "basics": {
                    "title": "Java Basics",
                    "lessons": [
                        {
                            "id": 1,
                            "title": "Java Introduction",
                            "content": """
# Java Introduction

Java is a popular programming language, created in 1995.
It is owned by Oracle, and more than 3 billion devices run Java.

## What can Java do?
- Mobile applications (specially Android apps)
- Desktop applications
- Web applications
- Web servers and application servers
- Games
- Database connection

## Why Use Java?
- Java works on different platforms (Windows, Mac, Linux, Raspberry Pi, etc.)
- It is one of the most popular programming language in the world
- It has a large demand in the current job market
- It is easy to learn and simple to use
- It is open-source and free
- It is secure, fast and powerful

## Example:
```java
public class Main {
  public static void main(String[] args) {
    System.out.println("Hello World");
  }
}
```
                            """,
                            "code_example": 'public class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello World");\n  }\n}',
                            "quiz": [
                                {
                                    "question": "What year was Java created?",
                                    "options": ["1991", "1995", "2000", "1985"],
                                    "correct": 1
                                }
                            ]
                        }
                    ]
                }
            }
        }
    
    async def get_course_content(self, language: str) -> Dict[str, Any]:
        """Get course content for a specific programming language"""
        if language not in self.course_content:
            return {"error": "Language not found"}
        
        return {
            "language": language,
            "content": self.course_content[language],
            "progress": 0,
            "total_lessons": sum(len(section["lessons"]) for section in self.course_content[language].values())
        }
    
    async def get_lesson(self, language: str, section: str, lesson_id: int) -> Dict[str, Any]:
        """Get specific lesson content"""
        try:
            lessons = self.course_content[language][section]["lessons"]
            lesson = next(l for l in lessons if l["id"] == lesson_id)
            return lesson
        except (KeyError, StopIteration):
            return {"error": "Lesson not found"}
    
    async def submit_quiz_answer(self, language: str, lesson_id: int, answer: int) -> Dict[str, Any]:
        """Submit quiz answer and get result"""
        # Find the lesson and check answer
        for section in self.course_content[language].values():
            for lesson in section["lessons"]:
                if lesson["id"] == lesson_id:
                    quiz = lesson["quiz"][0]  # Assuming one quiz per lesson
                    is_correct = answer == quiz["correct"]
                    return {
                        "correct": is_correct,
                        "explanation": f"The correct answer is: {quiz['options'][quiz['correct']]}"
                    }
        return {"error": "Quiz not found"}
