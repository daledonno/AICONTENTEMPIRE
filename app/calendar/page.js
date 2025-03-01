// app/calendar/page.js
'use client';

import { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Filter,
  Youtube,
  Twitter,
  Facebook,
  Instagram,
  Linkedin,
  Clock,
  Edit,
  Copy,
  Trash2,
  CheckCircle,
  Clock as ClockIcon,
  AlertCircle,
  Eye
} from 'lucide-react';

export default function ContentCalendar() {
  const [viewMode, setViewMode] = useState('week');
  const [currentMonth, setCurrentMonth] = useState('March 2025');
  
  // Sample content items
  const contentItems = [
    {
      id: 1,
      title: "AI Image Generation: 5 Mind-Blowing Tools",
      date: "Mar 1, 2025",
      time: "10:00 AM",
      platforms: ["youtube", "twitter"],
      status: "published",
      type: "video",
      metrics: {
        views: 1240,
        likes: 87,
        comments: 32
      }
    },
    {
      id: 2,
      title: "GPT-5 Capabilities and Use Cases",
      date: "Mar 3, 2025",
      time: "12:00 PM",
      platforms: ["youtube", "instagram", "twitter"],
      status: "scheduled",
      type: "video",
      metrics: {
        views: null,
        likes: null,
        comments: null
      }
    },
    {
      id: 3,
      title: "AI in Healthcare Applications",
      date: "Mar 4, 2025",
      time: "3:30 PM",
      platforms: ["youtube", "linkedin"],
      status: "draft",
      type: "video",
      metrics: {
        views: null,
        likes: null,
        comments: null
      }
    },
    {
      id: 4,
      title: "Ethical Considerations in AI Development",
      date: "Mar 7, 2025",
      time: "11:00 AM",
      platforms: ["youtube", "twitter", "linkedin"],
      status: "scheduled",
      type: "video",
      metrics: {
        views: null,
        likes: null,
        comments: null
      }
    },
    {
      id: 5,
      title: "Privacy in AI - What You Need to Know",
      date: "Mar 10, 2025",
      time: "2:00 PM",
      platforms: ["youtube", "instagram", "twitter"],
      status: "draft",
      type: "video",
      metrics: {
        views: null,
        likes: null,
        comments: null
      }
    }
  ];
  
  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'youtube':
        return <Youtube size={16} />;
      case 'twitter':
        return <Twitter size={16} />;
      case 'facebook':
        return <Facebook size={16} />;
      case 'instagram':
        return <Instagram size={16} />;
      case 'linkedin':
        return <Linkedin size={16} />;
      default:
        return null;
    }
  };
  
  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <span className="flex items-center text-xs px-2 py-1 rounded bg-green-900 bg-opacity-30 text-green-400">
            <CheckCircle size={12} className="mr-1" />
            Published
          </span>
        );
      case 'scheduled':
        return (
          <span className="flex items-center text-xs px-2 py-1 rounded bg-blue-900 bg-opacity-30 text-blue-400">
            <ClockIcon size={12} className="mr-1" />
            Scheduled
          </span>
        );
      case 'draft':
        return (
          <span className="flex items-center text-xs px-2 py-1 rounded bg-yellow-900 bg-opacity-30 text-yellow-400">
            <AlertCircle size={12} className="mr-1" />
            Draft
          </span>
        );
      default:
        return null;
    }
  };
  
  // Generate days of the week
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  // Generate calendar grid for week view
  const generateWeekCalendar = () => {
    return (
      <div className="grid grid-cols-7 gap-4 mt-4">
        {daysOfWeek.map((day, index) => (
          <div key={index} className="text-center">
            <div className="text-sm text-gray-400 mb-2">{day}</div>
            <div className={`rounded-full w-10 h-10 flex items-center justify-center mx-auto mb-2 ${index === 0 ? 'bg-gray-700 text-white' : ''}`}>
              {index + 1}
            </div>
            
            {/* Content items for this day */}
            <div className="space-y-2">
              {contentItems
                .filter(item => {
                  // This is a simplified check - in a real app you'd parse dates properly
                  return item.date.includes(`Mar ${index + 1}`);
                })
                .map(item => (
                  <div key={item.id} className="bg-gray-800 rounded-lg p-2 text-left">
                    <div className="text-xs text-gray-400 mb-1">{item.time}</div>
                    <div className="text-sm font-medium mb-1 line-clamp-2">{item.title}</div>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {item.platforms.map((platform, i) => (
                          <span key={i} className="text-gray-400">
                            {getPlatformIcon(platform)}
                          </span>
                        ))}
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Calendar</h1>
        <div className="flex space-x-3">
          <button className="btn-outline flex items-center">
            <Filter size={16} className="mr-2" />
            Filter
          </button>
          <button className="btn-primary flex items-center">
            <Plus size={16} className="mr-2" />
            Schedule Content
          </button>
        </div>
      </div>
      
      {/* Calendar header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <button className="btn-outline p-1">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-bold">{currentMonth}</h2>
            <button className="btn-outline p-1">
              <ChevronRight size={20} />
            </button>
          </div>
          
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button 
              className={`px-3 py-1 ${viewMode === 'month' ? 'bg-gray-700' : 'bg-transparent'}`}
              onClick={() => setViewMode('month')}
            >
              Month
            </button>
            <button 
              className={`px-3 py-1 ${viewMode === 'week' ? 'bg-gray-700' : 'bg-transparent'}`}
              onClick={() => setViewMode('week')}
            >
              Week
            </button>
            <button 
              className={`px-3 py-1 ${viewMode === 'list' ? 'bg-gray-700' : 'bg-transparent'}`}
              onClick={() => setViewMode('list')}
            >
              List
            </button>
          </div>
        </div>
        
        {/* Platform filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button className="flex items-center px-3 py-1 rounded-full bg-red-900 bg-opacity-20 text-red-400 text-sm">
            <Youtube size={14} className="mr-1" />
            YouTube
          </button>
          <button className="flex items-center px-3 py-1 rounded-full bg-blue-900 bg-opacity-20 text-blue-400 text-sm">
            <Twitter size={14} className="mr-1" />
            Twitter
          </button>
          <button className="flex items-center px-3 py-1 rounded-full bg-pink-900 bg-opacity-20 text-pink-400 text-sm">
            <Instagram size={14} className="mr-1" />
            Instagram
          </button>
          <button className="flex items-center px-3 py-1 rounded-full bg-blue-900 bg-opacity-20 text-blue-400 text-sm">
            <Linkedin size={14} className="mr-1" />
            LinkedIn
          </button>
          <button className="flex items-center px-3 py-1 rounded-full bg-blue-900 bg-opacity-20 text-blue-400 text-sm">
            <Facebook size={14} className="mr-1" />
            Facebook
          </button>
        </div>
        
        {/* Calendar view */}
        {viewMode === 'week' && generateWeekCalendar()}
        
        {/* List view is shown when viewMode === 'list' */}
        {viewMode === 'list' && (
          <div className="space-y-4 mt-4">
            {contentItems.map(item => (
              <div key={item.id} className="flex items-center bg-gray-800 rounded-lg p-3">
                <div className="mr-4 text-center">
                  <div className="text-sm font-bold">{item.date.split(',')[0]}</div>
                  <div className="text-xs text-gray-400">{item.time}</div>
                </div>
                
                <div className="flex-grow">
                  <h3 className="font-bold">{item.title}</h3>
                  <div className="flex items-center mt-1">
                    <div className="flex space-x-1 mr-3">
                      {item.platforms.map((platform, i) => (
                        <span key={i} className="text-gray-400">
                          {getPlatformIcon(platform)}
                        </span>
                      ))}
                    </div>
                    {getStatusBadge(item.status)}
                    
                    {item.status === 'published' && (
                      <div className="ml-3 flex items-center text-xs text-gray-400">
                        <Eye size={12} className="mr-1" />
                        {item.metrics.views} views
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="btn-outline p-1">
                    <Edit size={16} />
                  </button>
                  <button className="btn-outline p-1">
                    <Copy size={16} />
                  </button>
                  <button className="btn-outline p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Quick scheduling section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Quick Schedule</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Content</label>
              <select className="input w-full">
                <option>Select content to schedule...</option>
                <option>AI Image Generation: 5 Mind-Blowing Tools</option>
                <option>GPT-5 Capabilities and Use Cases</option>
                <option>AI in Healthcare Applications</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Date</label>
                <input type="date" className="input w-full" />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Time</label>
                <input type="time" className="input w-full" />
              </div>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-1">Platforms</label>
              <div className="flex flex-wrap gap-2">
                <button className="flex items-center px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-sm">
                  <Youtube size={14} className="mr-1" />
                  YouTube
                </button>
                <button className="flex items-center px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-sm">
                  <Twitter size={14} className="mr-1" />
                  Twitter
                </button>
                <button className="flex items-center px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-sm">
                  <Instagram size={14} className="mr-1" />
                  Instagram
                </button>
                <button className="flex items-center px-3 py-1 rounded-full bg-gray-700 hover:bg-gray-600 text-sm">
                  <Linkedin size={14} className="mr-1" />
                  LinkedIn
                </button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button className="btn-primary">Schedule</button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h2 className="text-lg font-bold mb-4">Upcoming Schedule</h2>
          <div className="space-y-3">
            {contentItems
              .filter(item => item.status === 'scheduled')
              .map(item => (
                <div key={item.id} className="flex items-center p-3 rounded-lg hover:bg-gray-700">
                  <div className="mr-3">
                    <Clock size={20} className="text-blue-400" />
                  </div>
                  <div className="flex-grow">
                    <div className="text-sm font-medium">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.date} at {item.time}</div>
                  </div>
                  <div className="flex space-x-1">
                    {item.platforms.map((platform, i) => (
                      <span key={i} className="text-gray-400">
                        {getPlatformIcon(platform)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}