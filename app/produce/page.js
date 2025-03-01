"use client";

import { useState, useEffect, useRef } from "react";
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
  Image as ImageIcon,
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
  Download,
  Save,
  RefreshCw,
  Wand2,
  ChevronDown,
  Plus,
  Sparkles,
  FileText,
  Key
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ApiKeyConfig = ({ apiKeys, setApiKeys, onClose }) => {
  const [openAIKey, setOpenAIKey] = useState(apiKeys.openai || "");
  const [falKey, setFalKey] = useState(apiKeys.fal || "");
  const [preferredImageAPI, setPreferredImageAPI] = useState(apiKeys.preferredImageAPI || "openai");

  const saveKeys = () => {
    const newApiKeys = {
      openai: openAIKey,
      fal: falKey,
      preferredImageAPI: preferredImageAPI
    };
    
    localStorage.setItem('videoProductionAPIKeys', JSON.stringify(newApiKeys));
    setApiKeys(newApiKeys);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Key className="mr-2" size={20} />
          API Configuration
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">OpenAI API Key:</label>
            <input 
              type="password" 
              className="input w-full" 
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">FAL AI API Key:</label>
            <input 
              type="password" 
              className="input w-full" 
              value={falKey}
              onChange={(e) => setFalKey(e.target.value)}
              placeholder="key-..."
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">Preferred Image Generation API:</label>
            <div className="flex space-x-4 mt-2">
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="imageAPI" 
                  value="openai" 
                  checked={preferredImageAPI === "openai"} 
                  onChange={() => setPreferredImageAPI("openai")}
                  className="mr-2"
                />
                OpenAI (DALL-E)
              </label>
              <label className="flex items-center">
                <input 
                  type="radio" 
                  name="imageAPI" 
                  value="fal" 
                  checked={preferredImageAPI === "fal"} 
                  onChange={() => setPreferredImageAPI("fal")}
                  className="mr-2"
                />
                FAL (Ideogram)
              </label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <button className="btn-outline" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={saveKeys}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default function VideoProduction() {
  const [currentTab, setCurrentTab] = useState("editor");
  const [isLoading, setIsLoading] = useState(false);
  const [videoProjects, setVideoProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [timelineSegments, setTimelineSegments] = useState([]);
  const [editingSegmentId, setEditingSegmentId] = useState(null);
  const [selectedVoice, setSelectedVoice] = useState(1);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [promptText, setPromptText] = useState("");
  const [savedPrompts, setSavedPrompts] = useState([
    { id: 1, name: "Educational Explainer", text: "Create an educational video that explains [TOPIC] in simple terms with examples." },
    { id: 2, name: "Product Tutorial", text: "Create a step-by-step tutorial showing how to use [PRODUCT] with key features highlighted." },
    { id: 3, name: "Trending Topic", text: "Create a video discussing the latest trends in [INDUSTRY] and why they matter." }
  ]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [showPromptDropdown, setShowPromptDropdown] = useState(false);
  const [slideImages, setSlideImages] = useState({});
  const [generatingSlideIndex, setGeneratingSlideIndex] = useState(null);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    fal: "",
    preferredImageAPI: "openai"
  });

  const voices = [
    { id: 1, name: "Male - Professional" },
    { id: 2, name: "Female - Energetic" },
    { id: 3, name: "Male - Calm" },
    { id: 4, name: "Female - Professional" },
  ];

  const musicTracks = [
    { id: 1, name: "Energetic Pop", selected: true },
    { id: 2, name: "Chill Lofi", selected: false },
    { id: 3, name: "Corporate Uplifting", selected: false },
    { id: 4, name: "Cinematic Epic", selected: false },
  ];
  
  const [tracks, setTracks] = useState(musicTracks);

  useEffect(() => {
    const savedKeys = localStorage.getItem('videoProductionAPIKeys');
    if (savedKeys) {
      try {
        const parsedKeys = JSON.parse(savedKeys);
        setApiKeys(parsedKeys);
      } catch (error) {
        console.error("Failed to parse saved API keys:", error);
      }
    } else {
      setShowApiConfig(true);
    }
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/videos");
        if (response.ok) {
          const data = await response.json();
          setVideoProjects(data);
          
          if (data.length > 0 && !currentProject) {
            setCurrentProject(data[0]);
            if (data[0].status === "draft") {
              loadTimelineSegments(data[0].id);
            } else {
              setTimelineSegments([
                createEmptySegment("intro"),
                createEmptySegment("point"),
                createEmptySegment("point"),
                createEmptySegment("conclusion")
              ]);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      }
    };

    fetchProjects();
    
    const interval = setInterval(() => {
      if (currentProject?.status === "rendering") {
        checkRenderProgress(currentProject.id);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [currentProject?.id, currentProject?.status]);

  const checkRenderProgress = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/render/${projectId}/progress`);
      if (response.ok) {
        const data = await response.json();
        setRenderProgress(data.progress);
        
        if (data.status !== currentProject.status || data.progress !== currentProject.progress) {
          setVideoProjects(prev => 
            prev.map(p => p.id === projectId ? {...p, status: data.status, progress: data.progress} : p)
          );
          setCurrentProject(prev => ({...prev, status: data.status, progress: data.progress}));
        }
      }
    } catch (error) {
      console.error("Failed to check render progress:", error);
    }
  };

  const createEmptySegment = (type) => ({
    id: Date.now() + Math.random().toString(36).substring(2, 9),
    type: type,
    text: "",
    duration: 5,
    mediaType: "color",
    background: "#1e293b",
    visualPrompt: ""
  });

  const generateSlideImage = async (segmentId) => {
    const segment = timelineSegments.find(s => s.id === segmentId);
    if (!segment || !segment.visualPrompt) {
      alert("Please add a visual prompt first");
      return;
    }
    
    if ((apiKeys.preferredImageAPI === "openai" && !apiKeys.openai) || 
        (apiKeys.preferredImageAPI === "fal" && !apiKeys.fal)) {
      setShowApiConfig(true);
      return;
    }
    
    setGeneratingSlideIndex(segmentId);
    
    try {
      let imageUrl;
      
      if (apiKeys.preferredImageAPI === "openai" && apiKeys.openai) {
        const response = await fetch("https://api.openai.com/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKeys.openai}`
          },
          body: JSON.stringify({
            model: "dall-e-3",
            prompt: segment.visualPrompt,
            n: 1,
            size: "1024x1792",
            quality: "standard"
          })
        });
        
        if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
        const data = await response.json();
        imageUrl = data.data[0].url;
        
      } else if (apiKeys.preferredImageAPI === "fal" && apiKeys.fal) {
        const response = await fetch("https://api.fal.ai/v1/images/generations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKeys.fal}`
          },
          body: JSON.stringify({
            model_name: "fal-ai/ideogram/v2",
            prompt: segment.visualPrompt,
            orientation: "portrait",
            aspect_ratio: "9:16",
            width: 1024,
            height: 1792
          })
        });
        
        if (!response.ok) throw new Error(`FAL API error: ${response.statusText}`);
        const data = await response.json();
        imageUrl = data.images[0]?.url;
      }
      
      if (imageUrl) {
        setSlideImages(prev => ({
          ...prev,
          [segmentId]: imageUrl
        }));
      } else {
        throw new Error("Failed to generate image: No URL returned");
      }
      
    } catch (error) {
      console.error("Failed to generate slide:", error);
      alert(`Failed to generate slide: ${error.message}. Please try again.`);
    } finally {
      setGeneratingSlideIndex(null);
    }
  };

  const addSegment = (type = "point", insertAfterIndex = timelineSegments.length - 1) => {
    const newSegment = createEmptySegment(type);
    const newSegments = [...timelineSegments];
    newSegments.splice(insertAfterIndex + 1, 0, newSegment);
    setTimelineSegments(newSegments);
    setEditingSegmentId(newSegment.id);
  };

  const deleteSegment = (segmentId) => {
    if (timelineSegments.length <= 1) {
      alert("You must have at least one segment in the timeline.");
      return;
    }
    
    setTimelineSegments(prev => prev.filter(s => s.id !== segmentId));
    if (editingSegmentId === segmentId) {
      setEditingSegmentId(null);
    }
    
    setSlideImages(prev => {
      const newSlides = {...prev};
      delete newSlides[segmentId];
      return newSlides;
    });
  };

  const updateSegment = (segmentId, updates) => {
    setTimelineSegments(prev => 
      prev.map(segment => 
        segment.id === segmentId ? {...segment, ...updates} : segment
      )
    );
  };

  const startRendering = async () => {
    if (!currentProject) return;
    
    setIsLoading(true);
    try {
      await saveTimeline();
      
      const response = await fetch(`http://localhost:8000/api/render/${currentProject.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voiceId: selectedVoice,
          format: "mp4",
          resolution: "1080p"
        }),
      });
      
      if (response.ok) {
        setCurrentProject(prev => ({...prev, status: "rendering", progress: 0}));
        setVideoProjects(prev => 
          prev.map(p => p.id === currentProject.id ? {...p, status: "rendering", progress: 0} : p)
        );
        setCurrentTab("queue");
      }
    } catch (error) {
      console.error("Failed to start rendering:", error);
      alert("Failed to start rendering. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTimelineSegments = async (projectId) => {
    try {
      const response = await fetch(`http://localhost:8000/api/timeline/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setTimelineSegments(data.segments);
        if (data.slideImages) {
          setSlideImages(data.slideImages);
        }
      } else {
        setTimelineSegments([
          createEmptySegment("intro"),
          createEmptySegment("point"),
          createEmptySegment("point"),
          createEmptySegment("conclusion")
        ]);
      }
    } catch (error) {
      console.error("Failed to load timeline:", error);
      setTimelineSegments([
        createEmptySegment("intro"),
        createEmptySegment("point"),
        createEmptySegment("point"),
        createEmptySegment("conclusion")
      ]);
    }
  };

  const saveTimeline = async () => {
    if (!currentProject) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/timeline/${currentProject.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segments: timelineSegments,
          slideImages: slideImages
        }),
      });
      
      if (response.ok) {
        alert("Timeline saved successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to save timeline:", error);
      alert("Failed to save timeline. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateScriptOpenAI = async () => {
    if (!currentProject || !promptText) {
      alert("Please enter a prompt to generate a script");
      return;
    }
    
    if (!apiKeys.openai) {
      setShowApiConfig(true);
      return;
    }
    
    setIsGeneratingScript(true);
    try {
      try {
        const response = await fetch(`http://localhost:8000/api/generate-script/${currentProject.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: currentProject.title,
            prompt: promptText,
            segmentTypes: timelineSegments.map(s => s.type),
            apiKey: apiKeys.openai
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          
          setTimelineSegments(prev => 
            prev.map((segment, index) => ({
              ...segment,
              text: data.segments[index]?.text || segment.text,
              visualPrompt: data.segments[index]?.visualPrompt || segment.visualPrompt
            }))
          );
          
          if (selectedPrompt === null && promptText.trim() !== "") {
            const newPrompt = {
              id: Date.now(),
              name: `Custom ${savedPrompts.length + 1}`,
              text: promptText
            };
            setSavedPrompts(prev => [...prev, newPrompt]);
          }
          
          alert("Script generated! You can now edit it as needed.");
          return;
        }
      } catch (backendError) {
        console.error("Backend script generation failed, falling back to direct API:", backendError);
      }
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKeys.openai}`
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content: `You are a professional video script writer. Create a script for a short-form video with the following segments: ${timelineSegments.map(s => s.type).join(', ')}. 
              For each segment, also provide a visual prompt that could be used to generate an image for that segment.
              Return your response as JSON in this format:
              {
                "segments": [
                  {
                    "type": "intro",
                    "text": "Script text for this segment...",
                    "visualPrompt": "Description of the visual for this segment..."
                  },
                  ...
                ]
              }`
            },
            {
              role: "user",
              content: `Create a script for a video titled "${currentProject?.title || 'Untitled Video'}". Use this prompt for guidance: ${promptText}`
            }
          ]
        })
      });
      
      if (!response.ok) throw new Error(`OpenAI API error: ${response.statusText}`);
      
      const data = await response.json();
      let scriptData;
      
      try {
        const content = data.choices[0].message.content;
        scriptData = JSON.parse(content);
      } catch (parseError) {
        throw new Error("Failed to parse script data from API response");
      }
      
      if (scriptData && scriptData.segments) {
        const updatedSegments = timelineSegments.map(segment => {
          const matchingSegment = scriptData.segments.find(s => s.type === segment.type);
          if (matchingSegment) {
            return {
              ...segment,
              text: matchingSegment.text || segment.text,
              visualPrompt: matchingSegment.visualPrompt || segment.visualPrompt
            };
          }
          return segment;
        });
        
        setTimelineSegments(updatedSegments);
        
        if (selectedPrompt === null && promptText.trim() !== "") {
          const newPrompt = {
            id: Date.now(),
            name: `Custom ${savedPrompts.length + 1}`,
            text: promptText
          };
          setSavedPrompts(prev => [...prev, newPrompt]);
        }
        
        alert("Script generated! You can now edit it as needed.");
      }
    } catch (error) {
      console.error("Failed to generate script:", error);
      alert(`Failed to generate script: ${error.message}. Please try again.`);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Video Production Studio</h1>
          <p className="text-gray-400 mt-2">Create and manage your short-form videos</p>
        </div>
        
        <button 
          className="btn-outline flex items-center"
          onClick={() => setShowApiConfig(true)}
        >
          <Key size={16} className="mr-2" />
          API Settings
        </button>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            currentTab === "editor" ? "bg-purple-600 text-white" : "bg-gray-700"
          }`}
          onClick={() => setCurrentTab("editor")}
        >
          Editor
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            currentTab === "queue" ? "bg-purple-600 text-white" : "bg-gray-700"
          }`}
          onClick={() => setCurrentTab("queue")}
        >
          Queue
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            currentTab === "library" ? "bg-purple-600 text-white" : "bg-gray-700"
          }`}
          onClick={() => setCurrentTab("library")}
        >
          Library
        </button>
      </div>

      {currentTab === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="card mb-6">
              <h3 className="text-lg font-bold mb-4">Video Prompt</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Use Template:</label>
                  <div className="relative">
                    <button 
                      className="input w-full flex justify-between items-center"
                      onClick={() => setShowPromptDropdown(!showPromptDropdown)}
                    >
                      <span>{selectedPrompt ? savedPrompts.find(p => p.id === selectedPrompt)?.name : "Select a prompt template"}</span>
                      <ChevronDown size={16} />
                    </button>
                    
                    {showPromptDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg">
                        {savedPrompts.map(prompt => (
                          <div 
                            key={prompt.id}
                            className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              setSelectedPrompt(prompt.id);
                              setPromptText(prompt.text);
                              setShowPromptDropdown(false);
                            }}
                          >
                            {prompt.name}
                          </div>
                        ))}
                        <div 
                          className="px-4 py-2 border-t border-gray-700 hover:bg-gray-700 cursor-pointer text-purple-400 flex items-center"
                          onClick={() => {
                            setSelectedPrompt(null);
                            setPromptText("");
                            setShowPromptDropdown(false);
                          }}
                        >
                          <Plus size={14} className="mr-2" />
                          Create new prompt
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Prompt:</label>
                  <textarea 
                    className="input w-full h-24"
                    value={promptText}
                    onChange={(e) => {
                      setPromptText(e.target.value);
                      if (selectedPrompt) setSelectedPrompt(null);
                    }}
                    placeholder="Create a video about [TOPIC] that explains the key concepts and benefits..."
                  />
                </div>
                
                <button 
                  className="btn-primary flex items-center justify-center w-full"
                  onClick={generateScriptOpenAI}
                  disabled={isGeneratingScript || !promptText.trim()}
                >
                  {isGeneratingScript ? (
                    <>
                      <RefreshCw className="animate-spin mr-2" size={16} />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2" size={16} />
                      Generate Script & Visual Prompts
                    </>
                  )}
                </button>
              </div>
            </div>
            
            <div className="card mb-6">
              <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center mb-4">
                {currentProject?.status === "ready" ? (
                  <video 
                    className="w-full h-full rounded-lg" 
                    controls
                    src={`http://localhost:8000/api/videos/${currentProject?.id}/stream`}
                  />
                ) : (
                  <div className="text-gray-500 flex flex-col items-center">
                    <Video size={48} />
                    <p className="mt-2">Preview will appear here</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <button className="p-2 bg-gray-700 rounded-lg">
                    <Play size={20} />
                  </button>
                  <button className="p-2 bg-gray-700 rounded-lg">
                    <Volume2 size={20} />
                  </button>
                </div>
                
                <div>
                  <input 
                    type="text" 
                    className="input max-w-xs"
                    placeholder="Video Title" 
                    value={currentProject?.title || ""}
                    onChange={(e) => {
                      if (currentProject) {
                        setCurrentProject(prev => ({...prev, title: e.target.value}));
                      }
                    }}
                  />
                </div>
                
                <div>
                  <span className="text-sm text-gray-400">Duration: {timelineSegments.reduce((acc, segment) => acc + segment.duration, 0)}s</span>
                </div>
              </div>
            </div>
            
            <div className="card mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Generated Slides</h3>
                <div className="flex space-x-2 items-center">
                  <span className="text-xs text-gray-400">
                    Using {apiKeys.preferredImageAPI === "openai" ? "DALL-E" : "Ideogram"}
                  </span>
                  <button 
                    className="btn-outline text-sm flex items-center"
                    onClick={() => {
                      timelineSegments.forEach(segment => {
                        if (segment.visualPrompt && !slideImages[segment.id]) {
                          generateSlideImage(segment.id);
                        }
                      });
                    }}
                  >
                    <ImageIcon size={16} className="mr-2" />
                    Generate All Slides
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {timelineSegments.map((segment, index) => (
                  <div key={segment.id} className="min-w-[100px] max-w-[100px]">
                    <div 
                      className="aspect-[9/16] bg-gray-700 rounded-lg mb-1 flex items-center justify-center overflow-hidden"
                      style={{
                        backgroundImage: slideImages[segment.id] ? `url(${slideImages[segment.id]})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!slideImages[segment.id] && (
                        <button
                          className="text-gray-400 hover:text-white"
                          onClick={() => segment.visualPrompt && generateSlideImage(segment.id)}
                          disabled={!segment.visualPrompt || generatingSlideIndex === segment.id}
                        >
                          {generatingSlideIndex === segment.id ? (
                            <RefreshCw size={20} className="animate-spin" />
                          ) : (
                            <Plus size={20} />
                          )}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-center truncate">{`Slide ${index + 1}`}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Timeline</h3>
                <div className="flex space-x-2">
                  <button 
                    className="btn-outline text-sm flex items-center"
                    onClick={saveTimeline}
                    disabled={isLoading}
                  >
                    <Save size={16} className="mr-2" />
                    Save
                  </button>
                </div>
              </div> 
              <div className="space-y-4">
                {timelineSegments.map((segment, index) => (
                  <div 
                    key={segment.id} 
                    className={`border border-gray-700 rounded-lg p-4 ${editingSegmentId === segment.id ? 'border-purple-500 bg-gray-800/50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <span className="text-xs bg-gray-700 rounded-full px-2 py-1 mr-2 capitalize">{segment.type}</span>
                        <span className="text-sm text-gray-400">Slide {index + 1}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="text-gray-400 hover:text-white"
                          onClick={() => setEditingSegmentId(editingSegmentId === segment.id ? null : segment.id)}
                        >
                          {editingSegmentId === segment.id ? <X size={16} /> : <Edit size={16} />}
                        </button>
                        <button 
                          className="text-gray-400 hover:text-red-400"
                          onClick={() => deleteSegment(segment.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {editingSegmentId === segment.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Type:</label>
                          <select 
                            className="input w-full"
                            value={segment.type}
                            onChange={(e) => updateSegment(segment.id, { type: e.target.value })}
                          >
                            <option value="intro">Intro</option>
                            <option value="point">Point</option>
                            <option value="example">Example</option>
                            <option value="benefit">Benefit</option>
                            <option value="conclusion">Conclusion</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Script:</label>
                          <textarea 
                            className="input w-full h-20"
                            value={segment.text}
                            placeholder="Enter script text here..."
                            onChange={(e) => updateSegment(segment.id, { text: e.target.value })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Visual Prompt:</label>
                          <textarea 
                            className="input w-full h-20"
                            value={segment.visualPrompt}
                            placeholder="Describe what image to show (e.g. 'A professional showing how to use the product')"
                            onChange={(e) => updateSegment(segment.id, { visualPrompt: e.target.value })}
                          />
                        </div>
                        
                        <div className="flex space-x-4 items-center">
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Duration (seconds):</label>
                            <input 
                              type="number" 
                              className="input w-20"
                              min={1}
                              max={60}
                              value={segment.duration}
                              onChange={(e) => updateSegment(segment.id, { duration: parseInt(e.target.value) || 5 })}
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <label className="block text-xs text-gray-400 mb-1">Background Style:</label>
                            <select 
                              className="input w-full"
                              value={segment.mediaType}
                              onChange={(e) => updateSegment(segment.id, { mediaType: e.target.value })}
                            >
                              <option value="color">Solid Color</option>
                              <option value="image">Generated Image</option>
                              <option value="video">Stock Video</option>
                            </select>
                          </div>
                        </div>

                        {segment.mediaType === "color" && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">Background Color:</label>
                            <input 
                              type="color" 
                              className="w-full h-8 rounded cursor-pointer"
                              value={segment.background}
                              onChange={(e) => updateSegment(segment.id, { background: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm truncate">
                          {segment.text ? segment.text.substring(0, 120) + (segment.text.length > 120 ? '...' : '') : 'No script added yet.'}
                        </p>
                        
                        {segment.visualPrompt && (
                          <p className="text-xs text-gray-400 truncate">
                            Visual: {segment.visualPrompt.substring(0, 80) + (segment.visualPrompt.length > 80 ? '...' : '')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                <button 
                  className="bg-gray-800 border border-gray-700 border-dashed rounded-lg p-4 w-full flex items-center justify-center text-sm text-gray-400 hover:text-white hover:bg-gray-700"
                  onClick={() => addSegment()}
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add Segment
                </button>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="card mb-6">
              <h3 className="text-lg font-bold mb-4">Voice</h3>
              <div className="space-y-2">
                {voices.map(voice => (
                  <div 
                    key={voice.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${selectedVoice === voice.id ? 'bg-purple-600/20 border border-purple-500' : 'border border-gray-700'}`}
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <div className="flex items-center">
                      <Mic size={18} className="mr-3" />
                      <span>{voice.name}</span>
                    </div>
                    {selectedVoice === voice.id && (
                      <div className="h-4 w-4 rounded-full bg-purple-600 flex items-center justify-center">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="card mb-6">
              <h3 className="text-lg font-bold mb-4">Background Music</h3>
              <div className="space-y-2">
                {tracks.map(track => (
                  <div 
                    key={track.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${track.selected ? 'bg-purple-600/20 border border-purple-500' : 'border border-gray-700'}`}
                    onClick={() => setTracks(prev => 
                      prev.map(t => ({ ...t, selected: t.id === track.id }))
                    )}
                  >
                    <div className="flex items-center">
                      <Music size={18} className="mr-3" />
                      <span>{track.name}</span>
                    </div>
                    {track.selected && (
                      <div className="h-4 w-4 rounded-full bg-purple-600 flex items-center justify-center">
                        <Check size={12} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="btn-primary w-full flex items-center justify-center py-3 text-lg"
              onClick={startRendering}
              disabled={isLoading || !currentProject || timelineSegments.length === 0}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin mr-2" size={18} />
                  Processing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2" size={18} />
                  Render Video
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {currentTab === "queue" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Processing Queue</h2>
          
          <div className="grid gap-4">
            {videoProjects.filter(p => p.status === "rendering").map(project => (
              <div key={project.id} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium">{project.title || "Untitled Project"}</h3>
                  <span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded-full text-xs">Rendering</span>
                </div>
                
                <div className="w-full bg-gray-800 rounded-full h-2.5">
                  <div 
                    className="bg-purple-600 h-2.5 rounded-full" 
                    style={{ width: `${project.progress || renderProgress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-400">{project.progress || renderProgress}% complete</span>
                  <span className="text-sm text-gray-400">ETA: ~{Math.round(((100 - (project.progress || renderProgress)) / 10))} min</span>
                </div>
              </div>
            ))}
            
            {videoProjects.filter(p => p.status === "rendering").length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <RefreshCw size={40} className="mx-auto mb-4 opacity-20" />
                <p>No videos currently processing</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {currentTab === "library" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Video Library</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoProjects.filter(p => p.status === "ready").map(project => (
              <div key={project.id} className="card overflow-hidden">
                <div className="aspect-video bg-gray-900 relative group">
                  <video 
                    className="w-full h-full object-cover" 
                    src={`http://localhost:8000/api/videos/${project.id}/stream`}
                    poster={project.thumbnail}
                  />
                  
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-3 bg-white rounded-full">
                      <Play className="text-black" size={24} />
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-medium mb-2 truncate">{project.title || "Untitled Project"}</h3>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">{new Date(project.createdAt).toLocaleDateString()}</span>
                    
                    <div className="flex space-x-2">
                      <button className="p-1.5 rounded-lg bg-gray-700 text-gray-300 hover:text-white">
                        <Download size={16} />
                      </button>
                      <button className="p-1.5 rounded-lg bg-gray-700 text-gray-300 hover:text-white">
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="card flex flex-col items-center justify-center h-full border border-dashed border-gray-700 bg-transparent">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusCircle size={28} className="text-gray-400" />
                </div>
                <h3 className="font-medium mb-2">Create New Video</h3>
                <p className="text-sm text-gray-400">Start a new video production from scratch</p>
              </div>
            </div>
            
            {videoProjects.filter(p => p.status === "ready").length === 0 && (
              <div className="text-center py-12 text-gray-400 col-span-full">
                <Video size={40} className="mx-auto mb-4 opacity-20" />
                <p>No completed videos yet</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {showApiConfig && (
        <ApiKeyConfig 
          apiKeys={apiKeys} 
          setApiKeys={setApiKeys} 
          onClose={() => setShowApiConfig(false)} 
        />
      )}
    </div>
  );
}