// app/produce/page.js
"use client";

import { useState } from "react";
import {
  Video,
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Settings,
  Mic,
  Music,
  Image,
  Type,
  PlusCircle,
  Clock,
  Trash2,
  ArrowRight,
  Sliders,
  Edit,
  Check,
  X,
  Flag,
} from "lucide-react";

export default function VideoProduction() {
  const [currentTab, setCurrentTab] = useState("queue");

  // Sample video projects
  const videoProjects = [
    {
      id: 1,
      title: "AI Image Generation Tools",
      thumbnail: "/api/placeholder/320/180",
      status: "rendering",
      progress: 64,
      duration: "1:24",
      script: "AI Image Generation: 5 Mind-Blowing Tools...",
      created: "2 hours ago",
    },
    {
      id: 2,
      title: "GPT-5 Capabilities Overview",
      thumbnail: "/api/placeholder/320/180",
      status: "ready",
      progress: 100,
      duration: "2:37",
      script: "In this video we'll explore the latest capabilities...",
      created: "1 day ago",
    },
    {
      id: 3,
      title: "AI in Healthcare Applications",
      thumbnail: "/api/placeholder/320/180",
      status: "draft",
      progress: 30,
      duration: "1:52",
      script: "How AI is transforming modern healthcare...",
      created: "3 days ago",
    },
  ];

  // Sample voice options
  const voiceOptions = [
    { id: 1, name: "Professional Male", sample: "sample1.mp3" },
    { id: 2, name: "Professional Female", sample: "sample2.mp3" },
    { id: 3, name: "Friendly Male", sample: "sample3.mp3" },
    { id: 4, name: "Friendly Female", sample: "sample4.mp3" },
    { id: 5, name: "Energetic Presenter", sample: "sample5.mp3" },
  ];

  // Sample templates
  const videoTemplates = [
    { id: 1, name: "Clean Minimal", preview: "/api/placeholder/160/90" },
    { id: 2, name: "Tech Analysis", preview: "/api/placeholder/160/90" },
    { id: 3, name: "Tutorial Style", preview: "/api/placeholder/160/90" },
    { id: 4, name: "News Format", preview: "/api/placeholder/160/90" },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Video Production Manager</h1>
        <div className="flex space-x-3">
          <button className="btn-outline flex items-center">
            <Settings size={16} className="mr-2" />
            Options
          </button>
          <button className="btn-primary flex items-center">
            <PlusCircle size={16} className="mr-2" />
            New Video
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="flex border-b border-gray-700">
          <button
            className={`px-4 py-2 flex items-center ${
              currentTab === "queue"
                ? "border-b-2 border-purple-500 text-white"
                : "text-gray-400"
            }`}
            onClick={() => setCurrentTab("queue")}
          >
            <Video size={16} className="mr-2" />
            Video Queue
          </button>
          <button
            className={`px-4 py-2 flex items-center ${
              currentTab === "editor"
                ? "border-b-2 border-purple-500 text-white"
                : "text-gray-400"
            }`}
            onClick={() => setCurrentTab("editor")}
          >
            <Edit size={16} className="mr-2" />
            Video Editor
          </button>
          <button
            className={`px-4 py-2 flex items-center ${
              currentTab === "templates"
                ? "border-b-2 border-purple-500 text-white"
                : "text-gray-400"
            }`}
            onClick={() => setCurrentTab("templates")}
          >
            <Settings size={16} className="mr-2" />
            Templates
          </button>
        </div>
      </div>

      {/* Current tab content */}
      {currentTab === "queue" && (
        <>
          {/* Video projects */}
          <div className="grid grid-cols-1 gap-6 mb-8">
            {videoProjects.map((project) => (
              <div key={project.id} className="card flex flex-col md:flex-row">
                <div className="mb-4 md:mb-0 md:mr-4 md:w-1/4">
                  <div className="relative">
                    <img
                      src={project.thumbnail}
                      alt={project.title}
                      className="rounded-lg w-full h-40 object-cover"
                    />
                    <span className="absolute bottom-2 right-2 bg-gray-900 bg-opacity-70 px-2 py-1 rounded text-sm">
                      {project.duration}
                    </span>

                    {project.status === "rendering" && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                          <Clock size={24} className="mx-auto mb-2" />
                          <div className="text-sm">Rendering...</div>
                          <div className="w-32 h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full"
                              style={{ width: `${project.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-grow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{project.title}</h3>
                      <div className="text-sm text-gray-400 mb-2">
                        Created {project.created}
                      </div>

                      <div className="flex items-center mb-3">
                        {project.status === "ready" && (
                          <span className="bg-green-900 bg-opacity-30 text-green-400 text-xs px-2 py-1 rounded flex items-center">
                            <Check size={12} className="mr-1" />
                            Ready to Publish
                          </span>
                        )}
                        {project.status === "rendering" && (
                          <span className="bg-yellow-900 bg-opacity-30 text-yellow-400 text-xs px-2 py-1 rounded flex items-center">
                            <Clock size={12} className="mr-1" />
                            Rendering ({project.progress}%)
                          </span>
                        )}
                        {project.status === "draft" && (
                          <span className="bg-blue-900 bg-opacity-30 text-blue-400 text-xs px-2 py-1 rounded flex items-center">
                            <Edit size={12} className="mr-1" />
                            Draft
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button className="btn-outline p-2 text-sm">
                        <Edit size={16} />
                      </button>
                      <button className="btn-outline p-2 text-sm">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {project.script}
                  </p>

                  <div className="flex space-x-3 mt-auto">
                    {project.status === "ready" && (
                      <button className="btn-primary flex items-center text-sm py-1">
                        <Play size={14} className="mr-1" />
                        Preview
                      </button>
                    )}
                    {project.status === "ready" && (
                      <button className="btn-secondary flex items-center text-sm py-1">
                        <ArrowRight size={14} className="mr-1" />
                        Publish
                      </button>
                    )}
                    {project.status === "rendering" && (
                      <button className="btn-outline flex items-center text-sm py-1">
                        <Flag size={14} className="mr-1" />
                        Prioritize
                      </button>
                    )}
                    {project.status === "draft" && (
                      <button className="btn-primary flex items-center text-sm py-1">
                        <ArrowRight size={14} className="mr-1" />
                        Continue Editing
                      </button>
                    )}
                    <button className="btn-outline flex items-center text-sm py-1">
                      <Sliders size={14} className="mr-1" />
                      Options
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Create new video card */}
          <div className="card border border-dashed border-gray-700 flex flex-col items-center justify-center p-8">
            <Video size={48} className="text-gray-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Create New Video</h3>
            <p className="text-gray-400 text-center mb-4 max-w-md">
              Import a script from the Content Creator Studio or upload your own
              script to get started.
            </p>
            <div className="flex space-x-3">
              <button className="btn-primary flex items-center">
                <Upload size={16} className="mr-2" />
                Import Script
              </button>
              <button className="btn-outline flex items-center">
                <PlusCircle size={16} className="mr-2" />
                Start from Scratch
              </button>
            </div>
          </div>
        </>
      )}

      {currentTab === "editor" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="card mb-6">
              <h2 className="text-lg font-bold mb-3">Preview</h2>
              <div className="aspect-video bg-black rounded-lg mb-4 flex items-center justify-center">
                <img
                  src="/api/placeholder/640/360"
                  alt="Video preview"
                  className="rounded-lg h-full w-full object-cover"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button className="bg-white text-black rounded-full p-2 hover:bg-gray-200">
                    <Play size={20} />
                  </button>
                  <div className="h-1 w-64 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: "35%" }}
                    ></div>
                  </div>
                  <span className="text-sm">0:45 / 2:12</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="text-gray-400 hover:text-white">
                    <Volume2 size={20} />
                  </button>
                  <button className="text-gray-400 hover:text-white">
                    <Settings size={20} />
                  </button>
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-bold mb-3">Timeline</h2>
              <div className="flex items-center mb-4">
                <div className="text-sm text-gray-400 w-24">00:00 - 00:15</div>
                <div className="flex-grow h-12 bg-gray-700 rounded-lg flex items-center px-3">
                  Intro and hook
                </div>
              </div>
              <div className="flex items-center mb-4">
                <div className="text-sm text-gray-400 w-24">00:15 - 00:45</div>
                <div className="flex-grow h-12 bg-gray-700 rounded-lg flex items-center px-3">
                  Overview of AI image tools
                </div>
              </div>
              <div className="flex items-center mb-4">
                <div className="text-sm text-gray-400 w-24">00:45 - 01:30</div>
                <div className="flex-grow h-12 bg-purple-900 bg-opacity-50 border-l-4 border-purple-500 rounded-lg flex items-center px-3">
                  Midjourney examples and features
                </div>
              </div>
              <div className="flex items-center mb-4">
                <div className="text-sm text-gray-400 w-24">01:30 - 02:00</div>
                <div className="flex-grow h-12 bg-gray-700 rounded-lg flex items-center px-3">
                  DALL-E 3 examples and features
                </div>
              </div>
              <div className="flex items-center">
                <div className="text-sm text-gray-400 w-24">02:00 - 02:12</div>
                <div className="flex-grow h-12 bg-gray-700 rounded-lg flex items-center px-3">
                  Conclusion and call to action
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="card mb-6">
              <h2 className="text-lg font-bold mb-4">Voice Settings</h2>
              <div className="space-y-4">
                {voiceOptions.map((voice) => (
                  <div
                    key={voice.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-medium">{voice.name}</h4>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-1 text-gray-400 hover:text-white">
                        <Play size={16} />
                      </button>
                      <input
                        type="radio"
                        name="voice"
                        className="text-purple-500 focus:ring-purple-500"
                        defaultChecked={voice.id === 1}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                  <span className="text-sm">Speaking Rate</span>
                  <input type="range" className="w-32" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pitch</span>
                  <input type="range" className="w-32" />
                </div>
              </div>
            </div>

            <div className="card mb-6">
              <h2 className="text-lg font-bold mb-4">Elements</h2>
              <div className="space-y-3">
                <button className="btn-outline w-full text-left flex items-center justify-between">
                  <span className="flex items-center">
                    <Music size={16} className="mr-2" />
                    Background Music
                  </span>
                  <PlusCircle size={16} />
                </button>
                <button className="btn-outline w-full text-left flex items-center justify-between">
                  <span className="flex items-center">
                    <Image size={16} className="mr-2" />
                    Visuals & Images
                  </span>
                  <PlusCircle size={16} />
                </button>
                <button className="btn-outline w-full text-left flex items-center justify-between">
                  <span className="flex items-center">
                    <Type size={16} className="mr-2" />
                    Text & Captions
                  </span>
                  <PlusCircle size={16} />
                </button>
                <button className="btn-outline w-full text-left flex items-center justify-between">
                  <span className="flex items-center">
                    <Mic size={16} className="mr-2" />
                    Voice & Audio
                  </span>
                  <PlusCircle size={16} />
                </button>
              </div>
            </div>

            <div className="card">
              <h2 className="text-lg font-bold mb-4">Video Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Video Format
                  </label>
                  <select className="input w-full">
                    <option>Landscape (16:9)</option>
                    <option>Portrait (9:16)</option>
                    <option>Square (1:1)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Resolution
                  </label>
                  <select className="input w-full">
                    <option>1080p (Full HD)</option>
                    <option>720p (HD)</option>
                    <option>4K (Ultra HD)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Quality
                  </label>
                  <select className="input w-full">
                    <option>High (Slower Rendering)</option>
                    <option>Medium (Balanced)</option>
                    <option>Low (Faster Rendering)</option>
                  </select>
                </div>
                <div className="flex justify-end pt-3 border-t border-gray-700">
                  <button className="btn-primary">Start Rendering</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {videoTemplates.map((template) => (
            <div
              key={template.id}
              className="card hover:bg-gray-750 transition-colors"
            >
              <img
                src={template.preview}
                alt={template.name}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
              <h3 className="font-bold">{template.name}</h3>
              <div className="flex justify-between mt-3">
                <button className="btn-outline text-sm py-1">Preview</button>
                <button className="btn-primary text-sm py-1">
                  Use Template
                </button>
              </div>
            </div>
          ))}

          <div className="card border border-dashed border-gray-700 flex flex-col items-center justify-center">
            <PlusCircle size={32} className="text-gray-500 mb-3" />
            <h3 className="font-bold mb-1">Create Template</h3>
            <p className="text-sm text-gray-400 text-center mb-3">
              Create your own custom template
            </p>
            <button className="btn-outline text-sm">Create New</button>
          </div>
        </div>
      )}
    </div>
  );
}
