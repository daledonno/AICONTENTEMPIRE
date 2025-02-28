// app/trends/page.js
"use client";

import { useState } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  Calendar,
  BarChart2,
  Bookmark,
  BookmarkPlus,
  Youtube,
  Video,
  Share2,
  ExternalLink,
  Clock,
} from "lucide-react";

export default function TrendDiscovery() {
  const [activeTab, setActiveTab] = useState("youtube");

  // Sample trending data
  const trendingTopics = [
    {
      id: 1,
      title: "GPT-5 Capabilities and Use Cases",
      platform: "YouTube",
      growth: "+143%",
      views: "2.4M",
      timeframe: "Last 7 days",
      engagement: "High",
      thumbnail: "/api/placeholder/320/180",
      category: "Large Language Models",
      saved: false,
    },
    {
      id: 2,
      title: "AI Image Generation Advancements",
      platform: "TikTok",
      growth: "+98%",
      views: "5.7M",
      timeframe: "Last 7 days",
      engagement: "Very High",
      thumbnail: "/api/placeholder/320/180",
      category: "Visual AI",
      saved: true,
    },
    {
      id: 3,
      title: "Top AI Tools for Content Creation",
      platform: "YouTube",
      growth: "+76%",
      views: "1.2M",
      timeframe: "Last 7 days",
      engagement: "Medium",
      thumbnail: "/api/placeholder/320/180",
      category: "Productivity",
      saved: false,
    },
    {
      id: 4,
      title: "How AI is Transforming Healthcare",
      platform: "YouTube",
      growth: "+64%",
      views: "980K",
      timeframe: "Last 7 days",
      engagement: "High",
      thumbnail: "/api/placeholder/320/180",
      category: "Industry Focus",
      saved: false,
    },
    {
      id: 5,
      title: "Ethical Concerns in AI Development",
      platform: "TikTok",
      growth: "+53%",
      views: "3.2M",
      timeframe: "Last 7 days",
      engagement: "High",
      thumbnail: "/api/placeholder/320/180",
      category: "Ethics",
      saved: false,
    },
    {
      id: 6,
      title: "AI Programming Assistants Review",
      platform: "YouTube",
      growth: "+49%",
      views: "850K",
      timeframe: "Last 7 days",
      engagement: "Medium",
      thumbnail: "/api/placeholder/320/180",
      category: "Developer Tools",
      saved: true,
    },
  ];

  // Filter topics based on active tab
  const filteredTopics =
    activeTab === "all"
      ? trendingTopics
      : trendingTopics.filter((topic) =>
          activeTab === "youtube"
            ? topic.platform === "YouTube"
            : topic.platform === "TikTok"
        );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Trend Discovery</h1>
        <div className="flex space-x-3">
          <button className="btn-primary flex items-center">
            <BookmarkPlus size={16} className="mr-2" />
            Saved Trends
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for trends..."
              className="input pl-10 w-full"
            />
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
          </div>

          <div className="flex items-center space-x-2">
            <select className="input bg-gray-700 text-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 3 months</option>
            </select>

            <button className="btn-outline flex items-center">
              <Filter size={16} className="mr-2" />
              Filters
            </button>
          </div>
        </div>

        {/* Platform tabs */}
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-2 ${
              activeTab === "all"
                ? "border-b-2 border-purple-500 text-white"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("all")}
          >
            All Platforms
          </button>
          <button
            className={`px-4 py-2 flex items-center ${
              activeTab === "youtube"
                ? "border-b-2 border-purple-500 text-white"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("youtube")}
          >
            <Youtube size={16} className="mr-2" />
            YouTube
          </button>
          <button
            className={`px-4 py-2 flex items-center ${
              activeTab === "tiktok"
                ? "border-b-2 border-purple-500 text-white"
                : "text-gray-400"
            }`}
            onClick={() => setActiveTab("tiktok")}
          >
            <Video size={16} className="mr-2" />
            TikTok
          </button>
        </div>
      </div>

      {/* Trend cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {filteredTopics.map((topic) => (
          <div
            key={topic.id}
            className="card hover:bg-gray-750 transition-colors"
          >
            <div className="relative mb-3">
              <img
                src={topic.thumbnail}
                alt={topic.title}
                className="rounded-lg w-full h-40 object-cover"
              />
              <span className="absolute top-2 right-2 bg-gray-900 bg-opacity-70 px-2 py-1 rounded text-sm flex items-center">
                <Clock size={14} className="mr-1" />
                {topic.timeframe}
              </span>
              <div className="absolute bottom-2 left-2 bg-gray-900 bg-opacity-70 px-2 py-1 rounded text-sm">
                {topic.platform}
              </div>
              <span className="absolute bottom-2 right-2 bg-green-900 bg-opacity-70 px-2 py-1 rounded text-green-400 text-sm flex items-center">
                <TrendingUp size={14} className="mr-1" />
                {topic.growth}
              </span>
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold mb-1">{topic.title}</h3>
                <span className="bg-purple-900 bg-opacity-30 text-purple-400 text-xs px-2 py-1 rounded">
                  {topic.category}
                </span>
                <div className="mt-2 text-sm text-gray-400">
                  {topic.views} views · {topic.engagement} engagement
                </div>
              </div>
              <button className="text-gray-400 hover:text-white">
                {topic.saved ? (
                  <Bookmark size={18} />
                ) : (
                  <BookmarkPlus size={18} />
                )}
              </button>
            </div>

            <div className="mt-4 flex justify-between">
              <button className="btn-primary text-sm py-1 px-3">
                Create Content
              </button>
              <div className="flex space-x-2">
                <button className="btn-outline text-sm py-1 px-2">
                  <Share2 size={14} />
                </button>
                <button className="btn-outline text-sm py-1 px-2">
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Insights section */}
      <h2 className="text-xl font-bold mb-4">Trend Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold mb-3">Topic Growth Rate</h3>
          <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
            {/* Placeholder for chart */}
            <BarChart2 size={48} className="text-gray-500" />
          </div>
        </div>
        <div className="card">
          <h3 className="font-bold mb-3">Audience Demographics</h3>
          <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
            {/* Placeholder for chart */}
            <BarChart2 size={48} className="text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
