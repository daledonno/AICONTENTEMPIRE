"use client";

import { useState } from "react";
import {
  BarChart2,
  TrendingUp,
  Users,
  ThumbsUp,
  MessageSquare,
  Share2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Youtube,
  Twitter,
  Instagram,
  Linkedin,
  Facebook,
  Filter,
  Download,
  Eye,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function PerformanceTracker() {
  const [timeframe, setTimeframe] = useState("30days");
  const [platformFilter, setPlatformFilter] = useState("all");

  // Sample stats data
  const overviewStats = [
    {
      label: "Total Views",
      value: "54.3K",
      change: "+18%",
      icon: <Eye size={24} className="text-gray-400" />,
    },
    {
      label: "Watch Time (hrs)",
      value: "982",
      change: "+12%",
      icon: <Clock size={24} className="text-gray-400" />,
    },
    {
      label: "Subscribers",
      value: "3,241",
      change: "+7%",
      icon: <Users size={24} className="text-gray-400" />,
    },
    {
      label: "Engagement Rate",
      value: "6.8%",
      change: "+2.3%",
      icon: <ThumbsUp size={24} className="text-gray-400" />,
    },
  ];

  // Sample content performance data
  const contentPerformance = [
    {
      id: 1,
      title: "AI Image Generation: 5 Mind-Blowing Tools",
      date: "Mar 1, 2025",
      platforms: ["youtube", "twitter"],
      metrics: {
        views: 12480,
        engagement: 1240,
        likes: 873,
        comments: 142,
        shares: 324,
      },
      growth: "+43%",
    },
    {
      id: 2,
      title: "GPT-5 Capabilities and Use Cases",
      date: "Feb 24, 2025",
      platforms: ["youtube", "twitter", "linkedin"],
      metrics: {
        views: 9450,
        engagement: 945,
        likes: 612,
        comments: 98,
        shares: 235,
      },
      growth: "+28%",
    },
    {
      id: 3,
      title: "AI in Healthcare Applications",
      date: "Feb 18, 2025",
      platforms: ["youtube", "linkedin"],
      metrics: {
        views: 7320,
        engagement: 586,
        likes: 423,
        comments: 76,
        shares: 87,
      },
      growth: "+18%",
    },
    {
      id: 4,
      title: "Privacy in AI: What You Need to Know",
      date: "Feb 12, 2025",
      platforms: ["youtube", "twitter"],
      metrics: {
        views: 6840,
        engagement: 547,
        likes: 398,
        comments: 64,
        shares: 85,
      },
      growth: "+12%",
    },
    {
      id: 5,
      title: "Top 10 AI Tools for Content Creators",
      date: "Feb 5, 2025",
      platforms: ["youtube", "instagram"],
      metrics: {
        views: 18750,
        engagement: 1687,
        likes: 1243,
        comments: 213,
        shares: 231,
      },
      growth: "+87%",
    },
  ];

  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "youtube":
        return <Youtube size={16} className="text-gray-400" />;
      case "twitter":
        return <Twitter size={16} className="text-gray-400" />;
      case "facebook":
        return <Facebook size={16} className="text-gray-400" />;
      case "instagram":
        return <Instagram size={16} className="text-gray-400" />;
      case "linkedin":
        return <Linkedin size={16} className="text-gray-400" />;
      default:
        return null;
    }
  };

  // Filter content based on platform
  const filteredContent =
    platformFilter === "all"
      ? contentPerformance
      : contentPerformance.filter((item) =>
          item.platforms.includes(platformFilter)
        );

  return (
    <div className="container mx-auto p-4 min-h-screen bg-gray-900 text-white">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Performance Tracker</h1>
        <div className="flex space-x-3">
          <div className="relative">
            <select
              className="input pr-10 bg-gray-800 border-gray-700 text-white"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="7days" className="bg-gray-900 text-white">Last 7 days</option>
              <option value="30days" className="bg-gray-900 text-white">Last 30 days</option>
              <option value="90days" className="bg-gray-900 text-white">Last 90 days</option>
              <option value="year" className="bg-gray-900 text-white">Last year</option>
            </select>
            <ChevronDown
              size={16}
              className="absolute right-3 top-3 text-gray-400 pointer-events-none"
            />
          </div>
          <button className="btn-outline flex items-center border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
            <Filter size={16} className="mr-2" />
            Filter
          </button>
          <button className="btn-primary flex items-center">
            <Download size={16} className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {overviewStats.map((stat, index) => (
          <div key={index} className="card flex items-center bg-gray-800 border-gray-700">
            <div className="mr-4 bg-purple-900 bg-opacity-30 p-3 rounded-lg">
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold mr-2 text-white">{stat.value}</h3>
                <span className="text-green-400 text-sm">{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Growth Charts */}
      <div className="card mb-8 bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Growth Metrics</h2>
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button className="px-3 py-1 bg-gray-700 text-white">Views</button>
            <button className="px-3 py-1 bg-gray-800 border-l border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white">Engagement</button>
            <button className="px-3 py-1 bg-gray-800 border-l border-gray-700 text-gray-400 hover:bg-gray-700 hover:text-white">Followers</button>
          </div>
        </div>

        <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
          {/* Placeholder for chart */}
          <BarChart2 size={48} className="text-gray-400" />
        </div>
      </div>

      {/* Content Performance */}
      <div className="card mb-8 bg-gray-800 border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Content Performance</h2>

          {/* Platform filters */}
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded-full text-sm ${
                platformFilter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
              }`}
              onClick={() => setPlatformFilter("all")}
            >
              All Platforms
            </button>
            <button
              className={`flex items-center px-3 py-1 rounded-full text-sm ${
                platformFilter === "youtube"
                  ? "bg-red-600 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
              }`}
              onClick={() => setPlatformFilter("youtube")}
            >
              <Youtube size={14} className="mr-1" />
              YouTube
            </button>
            <button
              className={`flex items-center px-3 py-1 rounded-full text-sm ${
                platformFilter === "twitter"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
              }`}
              onClick={() => setPlatformFilter("twitter")}
            >
              <Twitter size={14} className="mr-1" />
              Twitter
            </button>
            <button
              className={`flex items-center px-3 py-1 rounded-full text-sm ${
                platformFilter === "linkedin"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
              }`}
              onClick={() => setPlatformFilter("linkedin")}
            >
              <Linkedin size={14} className="mr-1" />
              LinkedIn
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400">Content</th>
                <th className="text-center py-3 px-4 text-gray-400">Date</th>
                <th className="text-center py-3 px-4 text-gray-400">
                  Platforms
                </th>
                <th className="text-center py-3 px-4 text-gray-400">Views</th>
                <th className="text-center py-3 px-4 text-gray-400">Likes</th>
                <th className="text-center py-3 px-4 text-gray-400">
                  Comments
                </th>
                <th className="text-center py-3 px-4 text-gray-400">Shares</th>
                <th className="text-center py-3 px-4 text-gray-400">Growth</th>
                <th className="text-right py-3 px-4 text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredContent.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-700 hover:bg-gray-800"
                >
                  <td className="py-3 px-4">
                    <div className="font-medium text-white">{item.title}</div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="text-sm text-gray-400">{item.date}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-1">
                      {item.platforms.map((platform, i) => (
                        <span key={i} className="text-gray-400">
                          {getPlatformIcon(platform)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {item.metrics.views.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {item.metrics.likes.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {item.metrics.comments.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center text-white">
                    {item.metrics.shares.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-green-400">{item.growth}</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="btn-outline text-sm py-1 text-purple-400 border-purple-600 hover:bg-purple-600 hover:text-white">
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-gray-800 border-gray-700">
          <h2 className="text-lg font-bold mb-4 text-white">Top Performers</h2>
          <div className="space-y-4">
            {filteredContent
              .sort((a, b) => b.metrics.views - a.metrics.views)
              .slice(0, 3)
              .map((item, index) => (
                <div key={item.id} className="flex items-start">
                  <div className="mr-3 bg-purple-900 bg-opacity-30 p-2 rounded-lg text-lg font-bold min-w-[30px] text-center text-white">
                    #{index + 1}
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <div className="flex items-center text-sm text-gray-400 mt-1">
                      <div className="mr-3">
                        {item.metrics.views.toLocaleString()} views
                      </div>
                      <div className="flex items-center text-green-400">
                        <TrendingUp size={14} className="mr-1" />
                        {item.growth}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

            <div className="pt-2 border-t border-gray-700">
              <button className="text-purple-400 flex items-center text-sm">
                View all performance data
                <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-gray-800 border-gray-700">
          <h2 className="text-lg font-bold mb-4 text-white">Audience Demographics</h2>
          <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
            {/* Placeholder for demographics chart */}
            <BarChart2 size={48} className="text-gray-400" />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-400">Top Age Group</div>
              <div className="font-bold text-white">25-34</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Gender</div>
              <div className="font-bold text-white">62% Male</div>
            </div>
            <div>
              <div className="text-sm text-gray-400">Top Location</div>
              <div className="font-bold text-white">United States</div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .container {
          max-width: 7xl;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        .card {
          background: #1f2937;
          border: 1px solid #374151;
          border-radius: 0.5rem;
          padding: 1.5rem;
        }
        .input {
          background: #374151;
          border: 1px solid #4a5568;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          color: #fff;
          appearance: none;
        }
        .btn-primary {
          background: #9333ea;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: #a855f7;
        }
        .btn-outline {
          background: transparent;
          color: #9333ea;
          border: 1px solid #9333ea;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .btn-outline:hover {
          background: #9333ea;
          color: white;
        }
      `}</style>
    </div>
  );
}