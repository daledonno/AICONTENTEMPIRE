// app/page.js
"use client";

import Link from "next/link";
import {
  Compass,
  Feather,
  Video,
  Calendar,
  BarChart2,
  ArrowUpRight,
  TrendingUp,
  Users,
  Eye,
} from "lucide-react";

export default function Dashboard() {
  // Sample data for stats
  const stats = [
    {
      label: "Total Content Pieces",
      value: "47",
      icon: <Feather size={24} />,
      change: "+12%",
    },
    {
      label: "Total Views",
      value: "24.5K",
      icon: <Eye size={24} />,
      change: "+18%",
    },
    {
      label: "New Followers",
      value: "1,238",
      icon: <Users size={24} />,
      change: "+7%",
    },
    {
      label: "Trending Topics",
      value: "12",
      icon: <TrendingUp size={24} />,
      change: "+3",
    },
  ];

  // Sample data for recent trends
  const recentTrends = [
    { topic: "AI Image Generation", growth: "+143%", category: "Visual AI" },
    {
      topic: "GPT-5 Capabilities",
      growth: "+98%",
      category: "Large Language Models",
    },
    { topic: "AI in Healthcare", growth: "+76%", category: "Industry Focus" },
    { topic: "Privacy in AI", growth: "+62%", category: "Ethics" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Welcome to AI Content Authority Builder
        </h1>
        <button className="btn-primary flex items-center">
          Quick Action <ArrowUpRight size={16} className="ml-2" />
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card flex items-center">
            <div className="mr-4 bg-purple-900 bg-opacity-30 p-3 rounded-lg">
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
              <div className="flex items-center">
                <h3 className="text-2xl font-bold mr-2">{stat.value}</h3>
                <span className="text-green-400 text-sm">{stat.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Workflow Modules */}
      <h2 className="text-xl font-bold mb-4">Your Workflow</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/trends">
          <div className="card hover:bg-gray-700 transition-colors cursor-pointer h-full">
            <div className="bg-blue-900 bg-opacity-30 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-3">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Trend Discovery</h3>
            <p className="text-gray-400">
              Find emerging AI topics to create content about
            </p>
          </div>
        </Link>

        <Link href="/create">
          <div className="card hover:bg-gray-700 transition-colors cursor-pointer h-full">
            <div className="bg-purple-900 bg-opacity-30 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-3">
              <Feather size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Content Creator</h3>
            <p className="text-gray-400">
              Generate scripts and outlines with AI assistance
            </p>
          </div>
        </Link>

        <Link href="/produce">
          <div className="card hover:bg-gray-700 transition-colors cursor-pointer h-full">
            <div className="bg-red-900 bg-opacity-30 p-3 rounded-lg w-12 h-12 flex items-center justify-center mb-3">
              <Video size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Video Production</h3>
            <p className="text-gray-400">Create and manage short-form videos</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Recent Trending Topics</h3>
              <Link
                href="/trends"
                className="text-purple-400 text-sm flex items-center"
              >
                View all <ArrowUpRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-2 px-4 text-gray-400">Topic</th>
                    <th className="text-left py-2 px-4 text-gray-400">
                      Growth
                    </th>
                    <th className="text-left py-2 px-4 text-gray-400">
                      Category
                    </th>
                    <th className="text-right py-2 px-4 text-gray-400">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrends.map((trend, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-700 hover:bg-gray-700"
                    >
                      <td className="py-3 px-4">{trend.topic}</td>
                      <td className="py-3 px-4 text-green-400">
                        {trend.growth}
                      </td>
                      <td className="py-3 px-4">{trend.category}</td>
                      <td className="py-3 px-4 text-right">
                        <button className="btn-outline text-sm py-1">
                          Create Content
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div>
          <div className="card h-full">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/trends"
                className="flex items-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <Compass size={18} className="mr-2" />
                <span>Discover New Trends</span>
              </Link>
              <Link
                href="/create"
                className="flex items-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <Feather size={18} className="mr-2" />
                <span>Create New Script</span>
              </Link>
              <Link
                href="/produce"
                className="flex items-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <Video size={18} className="mr-2" />
                <span>Produce New Video</span>
              </Link>
              <Link
                href="/calendar"
                className="flex items-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <Calendar size={18} className="mr-2" />
                <span>Schedule Content</span>
              </Link>
              <Link
                href="/performance"
                className="flex items-center p-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                <BarChart2 size={18} className="mr-2" />
                <span>View Analytics</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
