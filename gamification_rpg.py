import json
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
import numpy as np

class RPGSchoolSystem:
    def __init__(self):
        self.player = RPGPlayer()
        self.school = VirtualSchool()
        self.quest_engine = QuestEngine()
        self.achievement_system = AchievementSystem()
        self.social_system = SocialSystem()
        
    def initialize_player(self, name="Nishan"):
        self.player.name = name
        self.player.enroll_in_school(self.school)
        return self.player.get_status()

class RPGPlayer:
    def __init__(self):
        self.name = ""
        self.level = 1
        self.xp = 0
        self.coins = 100
        self.energy = 100
        self.stats = {
            'intelligence': 10,
            'creativity': 10,
            'focus': 10,
            'collaboration': 10,
            'persistence': 10
        }
        self.subjects = {
            'physics': {'level': 1, 'xp': 0, 'mastery': 0},
            'chemistry': {'level': 1, 'xp': 0, 'mastery': 0},
            'biology': {'level': 1, 'xp': 0, 'mastery': 0},
            'mathematics': {'level': 1, 'xp': 0, 'mastery': 0},
            'english': {'level': 1, 'xp': 0, 'mastery': 0},
            'programming': {'level': 1, 'xp': 0, 'mastery': 0},
            'social_studies': {'level': 1, 'xp': 0, 'mastery': 0}
        }
        self.inventory = {
            'badges': [],
            'items': ['Basic Calculator', 'Notebook'],
            'avatars': ['Student Avatar'],
            'themes': ['Classic Theme']
        }
        self.achievements = []
        self.current_quests = []
        self.completed_quests = []
        self.streak_days = 0
        self.last_activity = None
        
    def gain_xp(self, subject, amount, activity_type="study"):
        # Subject XP
        self.subjects[subject]['xp'] += amount
        
        # Check subject level up
        if self.subjects[subject]['xp'] >= self.get_xp_for_next_level(self.subjects[subject]['level']):
            self.subjects[subject]['level'] += 1
            self.subjects[subject]['xp'] = 0
            return {'subject_level_up': True, 'subject': subject, 'new_level': self.subjects[subject]['level']}
        
        # Overall XP and level
        self.xp += amount // 2  # Half XP goes to overall level
        
        if self.xp >= self.get_xp_for_next_level(self.level):
            self.level += 1
            self.xp = 0
            self.coins += 50  # Bonus coins for leveling up
            return {'level_up': True, 'new_level': self.level}
        
        return {'xp_gained': amount}
    
    def get_xp_for_next_level(self, current_level):
        return current_level * 100 + 50
    
    def complete_quest(self, quest_id):
        quest = next((q for q in self.current_quests if q['id'] == quest_id), None)
        if quest:
            # Rewards
            self.coins += quest['rewards']['coins']
            self.gain_xp(quest['subject'], quest['rewards']['xp'])
            
            # Move to completed
            self.current_quests.remove(quest)
            self.completed_quests.append(quest)
            
            return quest['rewards']
        return None
    
    def get_status(self):
        return {
            'name': self.name,
            'level': self.level,
            'xp': self.xp,
            'coins': self.coins,
            'energy': self.energy,
            'stats': self.stats,
            'subjects': self.subjects,
            'achievements': len(self.achievements),
            'active_quests': len(self.current_quests),
            'streak': self.streak_days
        }

class VirtualSchool:
    def __init__(self):
        self.name = "Nishan's AI Academy"
        self.buildings = {
            'science_lab': ScienceLab(),
            'computer_lab': ComputerLab(),
            'library': VirtualLibrary(),
            'math_center': MathCenter(),
            'language_center': LanguageCenter(),
            'creativity_studio': CreativityStudio(),
            'collaboration_hub': CollaborationHub()
        }
        self.unlocked_areas = ['science_lab', 'library']  # Start with basic areas
        
    def unlock_area(self, area_name, player_level):
        unlock_requirements = {
            'computer_lab': 3,
            'math_center': 5,
            'language_center': 7,
            'creativity_studio': 10,
            'collaboration_hub': 15
        }
        
        if player_level >= unlock_requirements.get(area_name, 1):
            if area_name not in self.unlocked_areas:
                self.unlocked_areas.append(area_name)
                return True
        return False

class ScienceLab:
    def __init__(self):
        self.experiments = {
            'physics': ['Pendulum Motion', 'Circuit Analysis', 'Wave Interference'],
            'chemistry': ['Acid-Base Titration', 'Molecular Modeling', 'Reaction Kinetics'],
            'biology': ['Cell Division', 'DNA Extraction', 'Ecosystem Simulation']
        }
        
    def start_experiment(self, subject, experiment_name):
        if experiment_name in self.experiments.get(subject, []):
            return {
                'experiment': experiment_name,
                'duration': random.randint(10, 30),  # minutes
                'xp_reward': random.randint(50, 100),
                'coin_reward': random.randint(10, 25)
            }
        return None

class ComputerLab:
    def __init__(self):
        self.coding_challenges = {
            'beginner': ['Hello World', 'Variables & Types', 'Basic Loops'],
            'intermediate': ['Functions', 'Arrays', 'Object-Oriented Programming'],
            'advanced': ['Algorithms', 'Data Structures', 'Design Patterns']
        }
        
    def get_coding_challenge(self, difficulty='beginner'):
        challenges = self.coding_challenges.get(difficulty, [])
        if challenges:
            return {
                'challenge': random.choice(challenges),
                'difficulty': difficulty,
                'xp_reward': {'beginner': 30, 'intermediate': 60, 'advanced': 100}[difficulty],
                'time_limit': {'beginner': 15, 'intermediate': 30, 'advanced': 60}[difficulty]
            }
        return None

class QuestEngine:
    def __init__(self):
        self.quest_templates = self.load_quest_templates()
        self.active_quests = []
        
    def load_quest_templates(self):
        return {
            'daily_study': {
                'name': 'Daily Scholar',
                'description': 'Study for 30 minutes today',
                'type': 'daily',
                'requirements': {'study_time': 30},
                'rewards': {'xp': 50, 'coins': 20}
            },
            'quiz_master': {
                'name': 'Quiz Master',
                'description': 'Score 80% or higher on 3 quizzes',
                'type': 'challenge',
                'requirements': {'quiz_score': 80, 'quiz_count': 3},
                'rewards': {'xp': 100, 'coins': 50, 'badge': 'Quiz Master'}
            },
            'code_warrior': {
                'name': 'Code Warrior',
                'description': 'Complete 5 coding challenges',
                'type': 'programming',
                'requirements': {'coding_challenges': 5},
                'rewards': {'xp': 150, 'coins': 75, 'item': 'Advanced IDE'}
            },
            'cross_subject': {
                'name': 'Renaissance Scholar',
                'description': 'Study 3 different subjects in one day',
                'type': 'cross_subject',
                'requirements': {'subjects_studied': 3},
                'rewards': {'xp': 200, 'coins': 100, 'stat_boost': 'intelligence'}
            }
        }
    
    def generate_daily_quests(self, player_level):
        quests = []
        
        # Always include daily study quest
        daily_quest = self.quest_templates['daily_study'].copy()
        daily_quest['id'] = f"daily_{datetime.now().strftime('%Y%m%d')}"
        daily_quest['expires'] = datetime.now() + timedelta(days=1)
        quests.append(daily_quest)
        
        # Add level-appropriate quests
        if player_level >= 3:
            quiz_quest = self.quest_templates['quiz_master'].copy()
            quiz_quest['id'] = f"quiz_{random.randint(1000, 9999)}"
            quiz_quest['expires'] = datetime.now() + timedelta(days=3)
            quests.append(quiz_quest)
        
        if player_level >= 5:
            code_quest = self.quest_templates['code_warrior'].copy()
            code_quest['id'] = f"code_{random.randint(1000, 9999)}"
            code_quest['expires'] = datetime.now() + timedelta(days=7)
            quests.append(code_quest)
        
        return quests
    
    def create_story_quest(self, subject, difficulty='medium'):
        story_quests = {
            'physics': {
                'title': 'The Quantum Detective',
                'story': 'A mysterious energy anomaly has appeared in the city. Use your physics knowledge to investigate!',
                'chapters': [
                    {'name': 'Energy Analysis', 'task': 'Calculate the energy levels', 'xp': 75},
                    {'name': 'Wave Investigation', 'task': 'Analyze wave patterns', 'xp': 100},
                    {'name': 'Quantum Solution', 'task': 'Apply quantum principles', 'xp': 150}
                ]
            },
            'chemistry': {
                'title': 'The Alchemist\'s Formula',
                'story': 'An ancient formula has been discovered. Help decode its chemical secrets!',
                'chapters': [
                    {'name': 'Element Identification', 'task': 'Identify unknown elements', 'xp': 75},
                    {'name': 'Reaction Prediction', 'task': 'Predict chemical reactions', 'xp': 100},
                    {'name': 'Formula Completion', 'task': 'Complete the ancient formula', 'xp': 150}
                ]
            },
            'programming': {
                'title': 'The Code Cipher',
                'story': 'A secret message is hidden in code. Use your programming skills to decrypt it!',
                'chapters': [
                    {'name': 'Pattern Recognition', 'task': 'Find the coding pattern', 'xp': 75},
                    {'name': 'Algorithm Design', 'task': 'Create decryption algorithm', 'xp': 100},
                    {'name': 'Message Decoded', 'task': 'Decrypt the final message', 'xp': 150}
                ]
            }
        }
        
        return story_quests.get(subject, story_quests['physics'])

class AchievementSystem:
    def __init__(self):
        self.achievements = {
            'first_steps': {
                'name': 'First Steps',
                'description': 'Complete your first lesson',
                'icon': '🎯',
                'rarity': 'common',
                'rewards': {'coins': 25}
            },
            'week_warrior': {
                'name': 'Week Warrior',
                'description': 'Study for 7 consecutive days',
                'icon': '🔥',
                'rarity': 'uncommon',
                'rewards': {'coins': 100, 'item': 'Streak Multiplier'}
            },
            'quiz_perfectionist': {
                'name': 'Quiz Perfectionist',
                'description': 'Score 100% on 5 quizzes',
                'icon': '💯',
                'rarity': 'rare',
                'rewards': {'coins': 200, 'badge': 'Perfectionist'}
            },
            'polymath': {
                'name': 'Polymath',
                'description': 'Reach level 10 in all subjects',
                'icon': '🧠',
                'rarity': 'legendary',
                'rewards': {'coins': 500, 'avatar': 'Genius Avatar', 'title': 'Master Scholar'}
            },
            'code_ninja': {
                'name': 'Code Ninja',
                'description': 'Master 5 programming languages',
                'icon': '🥷',
                'rarity': 'epic',
                'rewards': {'coins': 300, 'item': 'Code Katana', 'skill_boost': 'programming'}
            }
        }
    
    def check_achievements(self, player):
        new_achievements = []
        
        # Check each achievement
        for achievement_id, achievement in self.achievements.items():
            if achievement_id not in player.achievements:
                if self.is_achievement_unlocked(achievement_id, player):
                    player.achievements.append(achievement_id)
                    new_achievements.append(achievement)
        
        return new_achievements
    
    def is_achievement_unlocked(self, achievement_id, player):
        if achievement_id == 'first_steps':
            return len(player.completed_quests) > 0
        elif achievement_id == 'week_warrior':
            return player.streak_days >= 7
        elif achievement_id == 'quiz_perfectionist':
            # Would need to track perfect quiz scores
            return False  # Placeholder
        elif achievement_id == 'polymath':
            return all(subject['level'] >= 10 for subject in player.subjects.values())
        elif achievement_id == 'code_ninja':
            # Would need to track programming language mastery
            return False  # Placeholder
        
        return False

class SocialSystem:
    def __init__(self):
        self.leaderboards = {
            'global_xp': [],
            'weekly_study_time': [],
            'quiz_scores': [],
            'coding_challenges': []
        }
        self.study_groups = []
        self.competitions = []
        
    def create_study_group(self, name, subject, max_members=5):
        group = {
            'id': len(self.study_groups) + 1,
            'name': name,
            'subject': subject,
            'members': [],
            'max_members': max_members,
            'created': datetime.now(),
            'activities': []
        }
        self.study_groups.append(group)
        return group
    
    def start_competition(self, comp_type, duration_days=7):
        competition = {
            'id': len(self.competitions) + 1,
            'type': comp_type,  # 'quiz_battle', 'coding_duel', 'study_marathon'
            'participants': [],
            'start_date': datetime.now(),
            'end_date': datetime.now() + timedelta(days=duration_days),
            'prizes': self.get_competition_prizes(comp_type),
            'leaderboard': []
        }
        self.competitions.append(competition)
        return competition
    
    def get_competition_prizes(self, comp_type):
        prizes = {
            'quiz_battle': {
                1: {'coins': 500, 'badge': 'Quiz Champion', 'title': 'Quiz Master'},
                2: {'coins': 300, 'badge': 'Quiz Expert'},
                3: {'coins': 200, 'badge': 'Quiz Ace'}
            },
            'coding_duel': {
                1: {'coins': 600, 'item': 'Golden Keyboard', 'title': 'Code Master'},
                2: {'coins': 400, 'item': 'Silver Mouse'},
                3: {'coins': 250, 'item': 'Bronze Badge'}
            },
            'study_marathon': {
                1: {'coins': 400, 'multiplier': '2x XP for 1 week', 'title': 'Study Champion'},
                2: {'coins': 250, 'multiplier': '1.5x XP for 1 week'},
                3: {'coins': 150, 'item': 'Focus Booster'}
            }
        }
        return prizes.get(comp_type, {})

class CodingGameEngine:
    def __init__(self):
        self.coding_quests = self.initialize_coding_quests()
        self.mini_games = self.initialize_mini_games()
        
    def initialize_coding_quests(self):
        return {
            'dragon_slayer': {
                'title': 'The Dragon Slayer Algorithm',
                'story': 'A dragon is terrorizing the kingdom! Write an algorithm to defeat it.',
                'language': 'python',
                'starter_code': '''
def slay_dragon(dragon_health, sword_damage):
    # Your code here
    pass
                ''',
                'test_cases': [
                    {'input': (100, 25), 'expected': 4},
                    {'input': (150, 30), 'expected': 5}
                ],
                'xp_reward': 200
            },
            'treasure_hunter': {
                'title': 'Treasure Hunter Pathfinding',
                'story': 'Find the shortest path to the treasure using algorithms!',
                'language': 'python',
                'starter_code': '''
def find_treasure_path(maze, start, treasure):
    # Implement pathfinding algorithm
    pass
                ''',
                'xp_reward': 250
            }
        }
    
    def initialize_mini_games(self):
        return {
            'syntax_runner': {
                'name': 'Syntax Runner',
                'description': 'Run and jump while fixing syntax errors!',
                'type': 'endless_runner',
                'languages': ['python', 'java', 'javascript']
            },
            'bug_crusher': {
                'name': 'Bug Crusher',
                'description': 'Crush bugs by identifying and fixing code errors!',
                'type': 'puzzle',
                'difficulty_levels': ['easy', 'medium', 'hard']
            },
            'algorithm_race': {
                'name': 'Algorithm Race',
                'description': 'Race against time to implement algorithms!',
                'type': 'time_trial',
                'algorithms': ['sorting', 'searching', 'graph_traversal']
            }
        }
    
    def start_coding_quest(self, quest_name):
        quest = self.coding_quests.get(quest_name)
        if quest:
            return {
                'quest': quest,
                'start_time': datetime.now(),
                'status': 'active'
            }
        return None
    
    def validate_quest_solution(self, quest_name, user_code):
        quest = self.coding_quests.get(quest_name)
        if not quest:
            return {'success': False, 'error': 'Quest not found'}
        
        try:
            # Execute user code with test cases
            exec_globals = {}
            exec(user_code, exec_globals)
            
            # Run test cases
            for test_case in quest.get('test_cases', []):
                # This would need proper sandboxing in production
                result = exec_globals['slay_dragon'](*test_case['input'])
                if result != test_case['expected']:
                    return {
                        'success': False,
                        'error': f"Test failed. Expected {test_case['expected']}, got {result}"
                    }
            
            return {
                'success': True,
                'xp_earned': quest['xp_reward'],
                'message': 'Quest completed successfully!'
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

class MotivationalSystem:
    def __init__(self):
        self.motivational_messages = {
            'encouragement': [
                "🌟 You're making amazing progress, Nishan!",
                "💪 Every line of code makes you stronger!",
                "🚀 Your dedication is inspiring!",
                "🎯 Focus and determination will get you there!",
                "⭐ You're becoming a true scholar!"
            ],
            'achievement': [
                "🏆 Outstanding achievement unlocked!",
                "🎉 Congratulations on your success!",
                "💎 You've earned something special!",
                "🔥 You're on fire today!",
                "👑 Truly exceptional work!"
            ],
            'comeback': [
                "💪 Every expert was once a beginner!",
                "🌱 Growth happens outside your comfort zone!",
                "🎯 Focus on progress, not perfection!",
                "⚡ You've got this, keep going!",
                "🌟 Mistakes are proof you're trying!"
            ]
        }
    
    def get_motivational_message(self, context='encouragement'):
        messages = self.motivational_messages.get(context, self.motivational_messages['encouragement'])
        return random.choice(messages)
    
    def generate_personalized_motivation(self, player_stats):
        # Generate motivation based on player's current state
        if player_stats['energy'] < 30:
            return "🔋 Take a short break to recharge your energy!"
        elif player_stats['streak'] > 7:
            return f"🔥 Amazing {player_stats['streak']}-day streak! You're unstoppable!"
        elif player_stats['level'] % 5 == 0:
            return f"🎊 Level {player_stats['level']} reached! You're becoming a master!"
        else:
            return self.get_motivational_message('encouragement')
