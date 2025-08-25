
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Settings, 
  Shield, 
  Clock, 
  Trophy, 
  Star,
  Edit,
  Save,
  X,
  Camera,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Activity,
  Gamepad2
} from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  robloxUsername: string;
  avatar?: string;
  joinDate: Date;
  lastActive: Date;
  totalSessions: number;
  totalPlayTime: number;
  favoriteGames: string[];
  achievements: Achievement[];
  preferences: UserPreferences;
  stats: UserStats;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: boolean;
  autoQueue: boolean;
  preferredGames: string[];
  sessionReminders: boolean;
}

interface UserStats {
  level: number;
  xp: number;
  nextLevelXp: number;
  successRate: number;
  averageSessionTime: number;
  longestSession: number;
  streak: number;
}

export default function UserProfileManager() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    // Load user profile (mock data)
    const mockProfile: UserProfile = {
      id: '1',
      username: 'john_doe',
      email: 'john.doe@example.com',
      robloxUsername: 'JohnDoe123',
      avatar: '/api/placeholder/100/100',
      joinDate: new Date(2024, 0, 15),
      lastActive: new Date(),
      totalSessions: 47,
      totalPlayTime: 23.5,
      favoriteGames: ['Blox Fruits', 'Pet Simulator X', 'Arsenal'],
      achievements: [
        {
          id: '1',
          name: 'First Steps',
          description: 'Complete your first gaming session',
          icon: '🎮',
          unlockedAt: new Date(2024, 0, 16),
          progress: 1,
          maxProgress: 1
        },
        {
          id: '2',
          name: 'Week Warrior',
          description: 'Use the bot for 7 consecutive days',
          icon: '🔥',
          progress: 5,
          maxProgress: 7
        },
        {
          id: '3',
          name: 'Game Master',
          description: 'Try 10 different games',
          icon: '🏆',
          progress: 3,
          maxProgress: 10
        }
      ],
      preferences: {
        theme: 'system',
        notifications: true,
        autoQueue: false,
        preferredGames: ['Blox Fruits', 'Arsenal'],
        sessionReminders: true
      },
      stats: {
        level: 12,
        xp: 2350,
        nextLevelXp: 3000,
        successRate: 94.7,
        averageSessionTime: 8.5,
        longestSession: 15,
        streak: 5
      }
    };

    setProfile(mockProfile);
    setEditForm(mockProfile);
  }, []);

  const handleSave = () => {
    if (profile && editForm) {
      setProfile({ ...profile, ...editForm });
      setIsEditing(false);
    }
  };

  const calculateLevelProgress = (xp: number, nextLevelXp: number) => {
    return (xp / nextLevelXp) * 100;
  };

  if (!profile) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar} />
                  <AvatarFallback className="bg-orange text-white text-xl">
                    {profile.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-black">{profile.username}</h1>
                <p className="text-gray-600">@{profile.robloxUsername}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {profile.joinDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Activity className="h-4 w-4" />
                    <span>Last active {profile.lastActive.toRelativeTimeString?.() || 'recently'}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave} className="bg-orange hover:bg-orange-dark text-white">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Level {profile.stats.level}</span>
              </div>
              <span className="text-sm text-gray-600">
                {profile.stats.xp} / {profile.stats.nextLevelXp} XP
              </span>
            </div>
            <Progress value={calculateLevelProgress(profile.stats.xp, profile.stats.nextLevelXp)} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                    <p className="text-2xl font-bold text-blue-600">{profile.totalSessions}</p>
                  </div>
                  <Gamepad2 className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Play Time</p>
                    <p className="text-2xl font-bold text-green-600">{profile.totalPlayTime}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Success Rate</p>
                    <p className="text-2xl font-bold text-orange-600">{profile.stats.successRate}%</p>
                  </div>
                  <Trophy className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Favorite Games */}
          <Card>
            <CardHeader>
              <CardTitle>Favorite Games</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.favoriteGames.map((game) => (
                  <Badge key={game} variant="secondary" className="px-3 py-1">
                    {game}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-lg font-bold">{profile.stats.successRate}%</span>
                </div>
                <Progress value={profile.stats.successRate} />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Session</span>
                  <span className="text-lg font-bold">{profile.stats.averageSessionTime} min</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Longest Session</span>
                  <span className="text-lg font-bold">{profile.stats.longestSession} min</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Streak</span>
                  <span className="text-lg font-bold">{profile.stats.streak} days</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Experience & Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    Level {profile.stats.level}
                  </div>
                  <div className="text-lg text-gray-600">
                    {profile.stats.xp} XP
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to next level</span>
                    <span>{profile.stats.nextLevelXp - profile.stats.xp} XP needed</span>
                  </div>
                  <Progress value={calculateLevelProgress(profile.stats.xp, profile.stats.nextLevelXp)} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {profile.achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.unlockedAt ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="flex-1">
                      <h3 className={`font-medium ${achievement.unlockedAt ? 'text-yellow-800' : 'text-gray-900'}`}>
                        {achievement.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {achievement.description}
                      </p>
                      <div className="mt-3">
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span>{achievement.progress} / {achievement.maxProgress}</span>
                          {achievement.unlockedAt && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              Unlocked
                            </Badge>
                          )}
                        </div>
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={editForm.username || ''}
                      onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="robloxUsername">Roblox Username</Label>
                    <Input
                      id="robloxUsername"
                      value={editForm.robloxUsername || ''}
                      onChange={(e) => setEditForm({...editForm, robloxUsername: e.target.value})}
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>Username</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">
                      {profile.username}
                    </div>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">
                      {profile.email}
                    </div>
                  </div>
                  <div>
                    <Label>Roblox Username</Label>
                    <div className="mt-1 p-2 bg-gray-50 rounded border">
                      {profile.robloxUsername}
                    </div>
                  </div>
                </div>
              )}

              <Separator />

              {/* Preferences */}
              <div>
                <h3 className="text-lg font-medium mb-4">Preferences</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications about bot availability</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile.preferences.notifications}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: { ...profile.preferences, notifications: e.target.checked }
                      })}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Auto Queue</Label>
                      <p className="text-sm text-gray-600">Automatically join bot queue when available</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile.preferences.autoQueue}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: { ...profile.preferences, autoQueue: e.target.checked }
                      })}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Session Reminders</Label>
                      <p className="text-sm text-gray-600">Get reminded when your session is about to end</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={profile.preferences.sessionReminders}
                      onChange={(e) => setProfile({
                        ...profile,
                        preferences: { ...profile.preferences, sessionReminders: e.target.checked }
                      })}
                      className="h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
