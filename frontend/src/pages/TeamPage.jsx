import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, arrayUnion, getDocs } from 'firebase/firestore';
import { Users, Plus, MessageCircle, Video, Trophy, Target, Clock, Star, Crown, Zap } from 'lucide-react';

const TeamPage = () => {
  const { user, userProfile } = useAuth();
  const [teams, setTeams] = useState([]);
  const [myTeams, setMyTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: '', description: '', subject: 'python', maxMembers: 5 });

  useEffect(() => {
    // Load all public teams
    const teamsQuery = query(collection(db, 'teams'), where('isPublic', '==', true));
    const unsubscribe = onSnapshot(teamsQuery, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(teamsData);
    });

    // Load user's teams
    if (userProfile?.teamIds?.length > 0) {
      const myTeamsQuery = query(collection(db, 'teams'), where('__name__', 'in', userProfile.teamIds));
      const unsubscribeMyTeams = onSnapshot(myTeamsQuery, (snapshot) => {
        const myTeamsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMyTeams(myTeamsData);
      });
      return () => {
        unsubscribe();
        unsubscribeMyTeams();
      };
    }

    return unsubscribe;
  }, [userProfile]);

  const createTeam = async (e) => {
    e.preventDefault();
    try {
      const teamData = {
        ...teamForm,
        createdBy: user.uid,
        createdAt: new Date(),
        members: [{
          uid: user.uid,
          name: userProfile.displayName,
          role: 'leader',
          joinedAt: new Date(),
          progress: userProfile.progress
        }],
        isPublic: true,
        stats: {
          totalStudyHours: 0,
          completedChallenges: 0,
          averageScore: 0
        }
      };

      const docRef = await addDoc(collection(db, 'teams'), teamData);
      
      // Update user's team list
      await updateDoc(doc(db, 'users', user.uid), {
        teamIds: arrayUnion(docRef.id)
      });

      setShowCreateForm(false);
      setTeamForm({ name: '', description: '', subject: 'python', maxMembers: 5 });
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  const joinTeam = async (teamId) => {
    try {
      const teamRef = doc(db, 'teams', teamId);
      await updateDoc(teamRef, {
        members: arrayUnion({
          uid: user.uid,
          name: userProfile.displayName,
          role: 'member',
          joinedAt: new Date(),
          progress: userProfile.progress
        })
      });

      await updateDoc(doc(db, 'users', user.uid), {
        teamIds: arrayUnion(teamId)
      });
    } catch (error) {
      console.error('Error joining team:', error);
    }
  };

  const TeamCard = ({ team, isMyTeam = false }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-l-4 border-blue-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">{team.name}</h3>
          <p className="text-gray-600 text-sm mb-3">{team.description}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {team.members?.length || 0}/{team.maxMembers}
            </span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
              {team.subject.toUpperCase()}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center text-yellow-500 mb-2">
            <Trophy className="w-5 h-5 mr-1" />
            <span className="font-bold">{team.stats?.averageScore || 0}%</span>
          </div>
          <div className="text-xs text-gray-500">Team Score</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center text-green-500 mb-1">
            <Clock className="w-4 h-4 mr-1" />
            <span className="font-bold">{team.stats?.totalStudyHours || 0}h</span>
          </div>
          <div className="text-xs text-gray-500">Study Hours</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-purple-500 mb-1">
            <Target className="w-4 h-4 mr-1" />
            <span className="font-bold">{team.stats?.completedChallenges || 0}</span>
          </div>
          <div className="text-xs text-gray-500">Challenges</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-orange-500 mb-1">
            <Zap className="w-4 h-4 mr-1" />
            <span className="font-bold">{team.members?.length || 0}</span>
          </div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {isMyTeam ? (
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTeam(team)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
            </button>
            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Video className="w-4 h-4 mr-2" />
              Meet
            </button>
          </div>
        ) : (
          <button
            onClick={() => joinTeam(team.id)}
            disabled={team.members?.length >= team.maxMembers}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Join Team
          </button>
        )}
        
        <div className="flex items-center space-x-1">
          {team.members?.slice(0, 3).map((member, idx) => (
            <div key={idx} className="relative">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {member.name?.charAt(0) || 'U'}
              </div>
              {member.role === 'leader' && (
                <Crown className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1" />
              )}
            </div>
          ))}
          {team.members?.length > 3 && (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 text-xs">
              +{team.members.length - 3}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const TeamChat = ({ team }) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{team.name} - Team Chat</h2>
        <button
          onClick={() => setActiveTeam(null)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
      
      <div className="h-96 bg-gray-50 rounded-lg p-4 mb-4 overflow-y-auto">
        <div className="text-center text-gray-500 py-8">
          Team chat will be implemented with real-time messaging
        </div>
      </div>
      
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Type your message..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Send
        </button>
      </div>
    </div>
  );

  if (activeTeam) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <TeamChat team={activeTeam} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Team Study</h1>
            <p className="text-gray-600">Collaborate, learn, and grow together</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Team
          </button>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">Create New Team</h2>
              <form onSubmit={createTeam} className="space-y-4">
                <input
                  type="text"
                  placeholder="Team Name"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm({...teamForm, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
                <textarea
                  placeholder="Description"
                  value={teamForm.description}
                  onChange={(e) => setTeamForm({...teamForm, description: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows="3"
                />
                <select
                  value={teamForm.subject}
                  onChange={(e) => setTeamForm({...teamForm, subject: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                  <option value="html">HTML/CSS</option>
                  <option value="sql">SQL</option>
                </select>
                <input
                  type="number"
                  placeholder="Max Members"
                  value={teamForm.maxMembers}
                  onChange={(e) => setTeamForm({...teamForm, maxMembers: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  min="2"
                  max="20"
                />
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Team
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {myTeams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2 text-yellow-500" />
              My Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTeams.map(team => (
                <TeamCard key={team.id} team={team} isMyTeam={true} />
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-500" />
            Discover Teams
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.filter(team => !userProfile?.teamIds?.includes(team.id)).map(team => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
