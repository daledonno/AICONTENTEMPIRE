"use client";

import { useState, useEffect } from "react";
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
  Key,
  Copy,
  Trash,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";

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
      <div className="bg-gray-100 rounded-lg p-6 max-w-md w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
          <Key className="mr-2" size={20} />
          API Configuration
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">OpenAI API Key:</label>
            <input 
              type="password" 
              className="input w-full bg-white border-gray-300 text-gray-900" 
              value={openAIKey}
              onChange={(e) => setOpenAIKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">FAL AI API Key:</label>
            <input 
              type="password" 
              className="input w-full bg-white border-gray-300 text-gray-900" 
              value={falKey}
              onChange={(e) => setFalKey(e.target.value)}
              placeholder="key-..."
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Preferred Image Generation API:</label>
            <div className="flex space-x-4 mt-2">
              <label className="flex items-center text-gray-900">
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
              <label className="flex items-center text-gray-900">
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
          <button className="btn-outline text-teal-500 border-teal-500 hover:bg-teal-500 hover:text-white" onClick={onClose}>Cancel</button>
          <button className="btn-primary bg-teal-500 hover:bg-teal-600 text-white" onClick={saveKeys}>Save</button>
        </div>
      </div>
    </div>
  );
};

const TemplateManager = ({ templates, onUpdate, onClose }) => {
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    structure: [{ type: "Hook", purpose: "Grab attention briefly" }],
    slide_duration: 3,
    max_words_per_segment: 8,
    captions: false,
    aspect_ratio: "9:16"
  });
  const [editingTemplate, setEditingTemplate] = useState(null);

  const addSegment = () => {
    setNewTemplate(prev => ({
      ...prev,
      structure: [...prev.structure, { type: "Point", purpose: "Add purpose here" }]
    }));
  };

  const updateSegment = (index, updates) => {
    setNewTemplate(prev => {
      const newStructure = [...prev.structure];
      newStructure[index] = { ...newStructure[index], ...updates };
      return { ...prev, structure: newStructure };
    });  // Removed extra closing parenthesis
  };

  const deleteSegment = (index) => {
    setNewTemplate(prev => ({
      ...prev,
      structure: prev.structure.filter((_, i) => i !== index)
    }));
  };

  const saveTemplate = () => {
    if (editingTemplate) {
      onUpdate({ ...newTemplate, id: editingTemplate.id });
    } else {
      onUpdate(newTemplate);
    }
    onClose();
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setNewTemplate({
      ...template,
      structure: [...template.structure]  // Clone structure to avoid mutation
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-gray-100 rounded-lg p-6 max-w-2xl w-full shadow-lg">
        <h2 className="text-xl font-bold mb-4 flex items-center text-gray-900">
          {editingTemplate ? "Edit Template" : "Create New Template"}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Template Name:</label>
            <input 
              type="text" 
              className="input w-full bg-white border-gray-300 text-gray-900" 
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              placeholder="e.g., Educational Explainer"
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description:</label>
            <textarea 
              className="input w-full h-20 bg-white border-gray-300 text-gray-900" 
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              placeholder="Describe the template purpose..."
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Segments:</label>
            {newTemplate.structure.map((segment, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <select 
                    className="input w-1/3 bg-white border-gray-300 text-gray-900"
                    value={segment.type}
                    onChange={(e) => updateSegment(index, { type: e.target.value })}
                  >
                    <option value="Hook">Hook</option>
                    <option value="Intro">Intro</option>
                    <option value="Point">Point</option>
                    <option value="Conclusion">Conclusion</option>
                    <option value="Curiosity Builder">Curiosity Builder</option>
                    <option value="Problem">Problem</option>
                    <option value="Pain Points">Pain Points</option>
                    <option value="Holy Grail Solution">Holy Grail Solution</option>
                  </select>
                  <button 
                    className="text-red-500 hover:text-red-700 ml-2"
                    onClick={() => deleteSegment(index)}
                  >
                    <Trash size={16} />
                  </button>
                </div>
                <textarea 
                  className="input w-full bg-white border-gray-300 text-gray-900" 
                  value={segment.purpose}
                  onChange={(e) => updateSegment(index, { purpose: e.target.value })}
                  placeholder="Enter purpose for this segment..."
                />
              </div>
            ))}
            <button 
              className="btn-outline text-teal-500 border-teal-500 hover:bg-teal-500 hover:text-white mt-2"
              onClick={addSegment}
            >
              <Plus size={16} className="mr-2" />
              Add Segment
            </button>
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Slide Duration (2-4s):</label>
            <input 
              type="number" 
              className="input w-full bg-white border-gray-300 text-gray-900" 
              min="2" 
              max="4" 
              value={newTemplate.slide_duration}
              onChange={(e) => setNewTemplate({ ...newTemplate, slide_duration: Math.min(4, Math.max(2, parseInt(e.target.value) || 3)) })}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Max Words per Segment:</label>
            <input 
              type="number" 
              className="input w-full bg-white border-gray-300 text-gray-900" 
              min="0" 
              value={newTemplate.max_words_per_segment}
              onChange={(e) => setNewTemplate({ ...newTemplate, max_words_per_segment: parseInt(e.target.value) || 8 })}
            />
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Captions On/Off:</label>
            <input 
              type="checkbox" 
              checked={newTemplate.captions}
              onChange={(e) => setNewTemplate({ ...newTemplate, captions: e.target.checked })}
              className="mr-2"
            />
            Use Captions
          </div>
          
          <div>
            <label className="block text-sm text-gray-600 mb-1">Aspect Ratio:</label>
            <select 
              className="input w-full bg-white border-gray-300 text-gray-900"
              value={newTemplate.aspect_ratio}
              onChange={(e) => setNewTemplate({ ...newTemplate, aspect_ratio: e.target.value })}
            >
              <option value="9:16">Portrait (9:16, Shorts)</option>
              <option value="16:9">Landscape (16:9, Long-Form)</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end space-x-2 mt-6">
          <button className="btn-outline text-teal-500 border-teal-500 hover:bg-teal-500 hover:text-white" onClick={onClose}>Cancel</button>
          <button className="btn-primary bg-teal-500 hover:bg-teal-600 text-white" onClick={saveTemplate}>Save Template</button>
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
  const [showTemplateManager, setShowTemplateManager] = useState(false);  // State for TemplateManager

  const [queue, setQueue] = useState([]);  // New state for queue
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

  const baseUrl = 'http://localhost:8000';

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
        const response = await axios.get(`${baseUrl}/api/videos`);
        if (response.status === 200) {
          const data = response.data;
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

    const fetchQueue = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/render/queue`);
        if (response.status === 200) {
          setQueue(response.data.queue || []);
        }
      } catch (error) {
        console.error("Failed to fetch queue:", error);
      }
    };

    fetchProjects();
    fetchQueue();
    
    const interval = setInterval(() => {
      if (currentProject?.status === "rendering") {
        checkRenderProgress(currentProject.id);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [currentProject?.id, currentProject?.status]);

  const checkRenderProgress = async (projectId) => {
    try {
      const response = await axios.get(`${baseUrl}/api/render/${projectId}/progress`);
      if (response.status === 200) {
        const data = response.data;
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
    duration: 5,  // Default to 5 seconds, but backend enforces 2-4s
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
      let apiUrl, apiKey;
      
      if (apiKeys.preferredImageAPI === "openai" && apiKeys.openai) {
        apiUrl = "https://api.openai.com/v1/images/generations";
        apiKey = apiKeys.openai;
        const response = await axios.post(apiUrl, {
          model: "dall-e-3",
          prompt: segment.visualPrompt,
          n: 1,
          size: "1024x1792",
          quality: "standard"
        }, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          }
        });
        
        if (!response.data) throw new Error(`OpenAI API error: ${response.statusText}`);
        imageUrl = response.data.data[0].url;
      } else if (apiKeys.preferredImageAPI === "fal" && apiKeys.fal) {
        apiUrl = "https://api.fal.ai/v1/images/generations";
        apiKey = apiKeys.fal;
        const response = await axios.post(apiUrl, {
          model_name: "fal-ai/ideogram/v2",
          prompt: segment.visualPrompt,
          orientation: "portrait",
          aspect_ratio: "9:16",
          width: 1024,
          height: 1792
        }, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          }
        });
        
        if (!response.data) throw new Error(`FAL API error: ${response.statusText}`);
        imageUrl = response.data.images[0]?.url;
      }
      
      if (imageUrl) {
        setSlideImages(prev => ({
          ...prev,
          [segmentId]: imageUrl
        }));
        await saveTimeline();  // Save image URL to backend
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
    if (!timelineSegments.length || !timelineSegments.some(s => s.text)) {
      alert("Timeline cannot be empty or all textless for rendering");
      return;
    }
    
    setIsLoading(true);
    try {
      await saveTimeline();
      
      const response = await axios.post(`${baseUrl}/api/render/${currentProject.id}`, {
        voiceId: selectedVoice,
        format: "mp4",
        resolution: "1080p",
        music_track: tracks.find(t => t.selected)?.name || "Energetic Pop",
        music_volume: 0.3,
        editing_style: "zoom"
      });
      
      if (response.status === 200) {
        setCurrentProject(prev => ({...prev, status: "rendering", progress: 0}));
        setVideoProjects(prev => 
          prev.map(p => p.id === currentProject.id ? {...p, status: "rendering", progress: 0} : p)
        );
        setCurrentTab("queue");
        fetchQueue();  // Update queue state
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
      const response = await axios.get(`${baseUrl}/api/timeline/${projectId}`);
      if (response.status === 200) {
        const data = response.data;
        setTimelineSegments(data.segments || [
          createEmptySegment("intro"),
          createEmptySegment("point"),
          createEmptySegment("point"),
          createEmptySegment("conclusion")
        ]);
        setSlideImages(data.slideImages || {});
      } else {
        setTimelineSegments([
          createEmptySegment("intro"),
          createEmptySegment("point"),
          createEmptySegment("point"),
          createEmptySegment("conclusion")
        ]);
        setSlideImages({});
      }
    } catch (error) {
      console.error("Failed to load timeline:", error);
      setTimelineSegments([
        createEmptySegment("intro"),
        createEmptySegment("point"),
        createEmptySegment("point"),
        createEmptySegment("conclusion")
      ]);
      setSlideImages({});
    }
  };

  const saveTimeline = async () => {
    if (!currentProject) return;
    if (!timelineSegments.length || !timelineSegments.some(s => s.text)) {
      alert("Timeline cannot be empty or all textless");
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/api/timeline/${currentProject.id}`, {
        segments: timelineSegments,
        slideImages: slideImages
      });
      
      if (response.status === 200) {
        alert("Timeline saved successfully!");
      } else {
        const error = response.data;
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
        const response = await axios.post(`${baseUrl}/api/generate-script/${currentProject.id}`, {
          title: currentProject.title,
          topic: promptText,  // Using prompt as topic for simplicity
          goal: "Inform and engage the audience",
          target_audience: "Tech enthusiasts",
          tone: "informative",
          target_duration: timelineSegments.reduce((acc, s) => acc + s.duration, 0),
          use_trends: false,
          segmentTypes: timelineSegments.map(s => s.type)
        });
        
        if (response.status === 200) {
          const data = response.data;
          
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
      
      const response = await axios.post("https://api.openai.com/v1/chat/completions", {
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
      }, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKeys.openai}`
        }
      });
      
      if (response.status !== 200) throw new Error(`OpenAI API error: ${response.statusText}`);
      
      const data = response.data;
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

  const clearQueue = async () => {
    try {
      const response = await axios.post(`${baseUrl}/api/clear-queue`);
      if (response.status === 200) {
        setQueue([]);
        alert("Queue cleared successfully!");
      } else {
        const error = response.data;
        alert(`Failed to clear queue: ${error.detail || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to clear queue:", error);
      alert("Failed to clear queue. Please try again.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl bg-white">
      <nav className="navbar navbar-expand-lg navbar-dark bg-gray-900 p-3 rounded mb-4 text-white">
        <div className="container-fluid">
          <a className="navbar-brand text-white text-xl font-bold" href="/">AI Content Empire</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <Link href="/" className="nav-link text-white hover:text-gray-300">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link href="/trends" className="nav-link text-white hover:text-gray-300">Trend Discovery</Link>
              </li>
              <li className="nav-item">
                <Link href="/content-creator" className="nav-link text-white hover:text-gray-300">Content Creator</Link>
              </li>
              <li className="nav-item">
                <Link href="/produce" className="nav-link text-white hover:text-gray-300">Video Production</Link>
              </li>
              <li className="nav-item">
                <Link href="/calendar" className="nav-link text-white hover:text-gray-300">Content Calendar</Link>
              </li>
              <li className="nav-item">
                <Link href="/performance" className="nav-link text-white hover:text-gray-300">Performance</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Video Production Studio</h1>
          <p className="text-gray-600 mt-2">Create and manage your short-form videos</p>
        </div>
        
        <button 
          className="btn-outline flex items-center text-teal-500 border-teal-500 hover:bg-teal-500 hover:text-white"
          onClick={() => setShowApiConfig(true)}
        >
          <Key size={16} className="mr-2" />
          API Settings
        </button>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          className={`px-4 py-2 rounded-lg ${
            currentTab === "editor" ? "bg-teal-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setCurrentTab("editor")}
        >
          Editor
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            currentTab === "queue" ? "bg-teal-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setCurrentTab("queue")}
        >
          Queue
        </button>
        <button
          className={`px-4 py-2 rounded-lg ${
            currentTab === "library" ? "bg-teal-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => setCurrentTab("library")}
        >
          Library
        </button>
      </div>

      {currentTab === "editor" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Video Prompt & Template</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Select Template:</label>
                  <div className="relative">
                    <button 
                      className="input w-full bg-white border-gray-300 text-gray-900 flex justify-between items-center"
                      onClick={() => setShowPromptDropdown(!showPromptDropdown)}
                    >
                      <span>{selectedPrompt ? savedPrompts.find(p => p.id === selectedPrompt)?.name : "Select a template"}</span>
                      <ChevronDown size={16} />
                    </button>
                    
                    {showPromptDropdown && (
                      <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg">
                        {savedPrompts.map(prompt => (
                          <div 
                            key={prompt.id}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                            onClick={() => {
                              setSelectedPrompt(prompt.id);
                              setPromptText(prompt.text);
                              setShowPromptDropdown(false);
                              applyTemplate(prompt.id);  // Apply template to timeline
                            }}
                          >
                            {prompt.name}
                          </div>
                        ))}
                        <div 
                          className="px-4 py-2 border-t border-gray-300 hover:bg-gray-100 cursor-pointer text-teal-500 flex items-center"
                          onClick={() => {
                            setSelectedPrompt(null);
                            setPromptText("");
                            setShowPromptDropdown(false);
                            setShowTemplateManager(true);  // Fixed to lowercase 'showTemplateManager'
                          }}
                        >
                          <Plus size={14} className="mr-2" />
                          Create/Edit Template
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Prompt:</label>
                  <textarea 
                    className="input w-full h-24 bg-white border-gray-300 text-gray-900"
                    value={promptText}
                    onChange={(e) => {
                      setPromptText(e.target.value);
                      if (selectedPrompt) setSelectedPrompt(null);
                    }}
                    placeholder="Create a video about [TOPIC] that explains the key concepts and benefits..."
                  />
                </div>
                
                <button 
                  className="btn-primary bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center w-full"
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
            
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
              <div className="aspect-video bg-white rounded-lg flex items-center justify-center mb-4 border border-gray-200">
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
                  <button className="p-2 bg-gray-200 rounded-lg text-gray-900 hover:bg-gray-300">
                    <Play size={20} />
                  </button>
                  <button className="p-2 bg-gray-200 rounded-lg text-gray-900 hover:bg-gray-300">
                    <Volume2 size={20} />
                  </button>
                </div>
                
                <div>
                  <input 
                    type="text" 
                    className="input max-w-xs bg-white border-gray-300 text-gray-900"
                    placeholder="Video Title" 
                    value={currentProject?.title || ""}
                    onChange={(e) => {
                      if (currentProject) {
                        setCurrentProject(prev => ({...prev, title: e.target.value}));
                        updateProjectTitle(currentProject.id, e.target.value);
                      }
                    }}
                  />
                </div>
                
                <div>
                  <span className="text-sm text-gray-600">Duration: {timelineSegments.reduce((acc, segment) => acc + segment.duration, 0)}s</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Generated Slides</h3>
                <div className="flex space-x-2 items-center">
                  <span className="text-xs text-gray-600">
                    Using {apiKeys.preferredImageAPI === "openai" ? "DALL-E" : "Ideogram"}
                  </span>
                  <button 
                    className="btn-outline text-sm flex items-center text-teal-500 border-teal-500 hover:bg-teal-500 hover:text-white"
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
                      className="aspect-[9/16] bg-white rounded-lg mb-1 flex items-center justify-center overflow-hidden border border-gray-200"
                      style={{
                        backgroundImage: slideImages[segment.id] ? `url(${slideImages[segment.id]})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    >
                      {!slideImages[segment.id] && (
                        <button
                          className="text-gray-600 hover:text-teal-500"
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
                    <p className="text-xs text-center text-gray-900 truncate">{`Slide ${index + 1}`}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Timeline</h3>
                <div className="flex space-x-2">
                  <button 
                    className="btn-outline text-sm flex items-center text-teal-500 border-teal-500 hover:bg-teal-500 hover:text-white"
                    onClick={saveTimeline}
                    disabled={isLoading}
                  >
                    <Save size={16} className="mr-2" />
                    Save
                  </button>
                  <button 
                    className="btn-outline text-sm flex items-center text-teal-500 border-teal-500 hover:bg-teal-500 hover:text-white"
                    onClick={() => setShowTemplateManager(true)}  // Fixed to lowercase 'showTemplateManager'
                  >
                    <Pencil size={16} className="mr-2" />
                    Manage Templates
                  </button>
                </div>
              </div> 
              <div className="space-y-4">
                {timelineSegments.map((segment, index) => (
                  <div 
                    key={segment.id} 
                    className={`border border-gray-300 rounded-lg p-4 ${editingSegmentId === segment.id ? 'border-teal-500 bg-gray-50' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center">
                        <span className="text-xs bg-gray-200 rounded-full px-2 py-1 mr-2 capitalize text-gray-900">{segment.type}</span>
                        <span className="text-sm text-gray-600">Slide {index + 1}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="text-gray-600 hover:text-teal-500"
                          onClick={() => setEditingSegmentId(editingSegmentId === segment.id ? null : segment.id)}
                        >
                          {editingSegmentId === segment.id ? <X size={16} /> : <Edit size={16} />}
                        </button>
                        <button 
                          className="text-gray-600 hover:text-red-500"
                          onClick={() => deleteSegment(segment.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button 
                          className="text-gray-600 hover:text-teal-500"
                          onClick={() => duplicateSegment(segment.id)}
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {editingSegmentId === segment.id ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Type:</label>
                          <select 
                            className="input w-full bg-white border-gray-300 text-gray-900"
                            value={segment.type}
                            onChange={(e) => updateSegment(segment.id, { type: e.target.value })}
                          >
                            <option value="Hook">Hook</option>
                            <option value="Intro">Intro</option>
                            <option value="Point">Point</option>
                            <option value="Conclusion">Conclusion</option>
                            <option value="Curiosity Builder">Curiosity Builder</option>
                            <option value="Problem">Problem</option>
                            <option value="Pain Points">Pain Points</option>
                            <option value="Holy Grail Solution">Holy Grail Solution</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Script:</label>
                          <textarea 
                            className="input w-full h-20 bg-white border-gray-300 text-gray-900"
                            value={segment.text}
                            placeholder="Enter script text here..."
                            onChange={(e) => updateSegment(segment.id, { text: e.target.value })}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Visual Prompt:</label>
                          <textarea 
                            className="input w-full h-20 bg-white border-gray-300 text-gray-900"
                            value={segment.visualPrompt}
                            placeholder="Describe what image to show (e.g. 'A professional showing how to use the product')"
                            onChange={(e) => updateSegment(segment.id, { visualPrompt: e.target.value })}
                          />
                        </div>
                        
                        <div className="flex space-x-4 items-center">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Duration (2-4s):</label>
                            <input 
                              type="number" 
                              className="input w-20 bg-white border-gray-300 text-gray-900"
                              min={2}  // Enforce 2-4 second range
                              max={4}
                              value={segment.duration}
                              onChange={(e) => updateSegment(segment.id, { duration: Math.min(4, Math.max(2, parseInt(e.target.value) || 3)) })}
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <label className="block text-xs text-gray-600 mb-1">Media Type:</label>
                            <select 
                              className="input w-full bg-white border-gray-300 text-gray-900"
                              value={segment.mediaType}
                              onChange={(e) => updateSegment(segment.id, { mediaType: e.target.value })}
                            >
                              <option value="color">Solid Color</option>
                              <option value="image">Generated Image</option>
                              <option value="video">Custom Video</option>
                            </select>
                          </div>
                        </div>

                        {segment.mediaType === "color" && (
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Background Color:</label>
                            <input 
                              type="color" 
                              className="w-full h-8 rounded cursor-pointer"
                              value={segment.background}
                              onChange={(e) => updateSegment(segment.id, { background: e.target.value })}
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Captions On/Off:</label>
                          <input 
                            type="checkbox" 
                            checked={segment.captions}
                            onChange={(e) => updateSegment(segment.id, { captions: e.target.checked })}
                            className="mr-2"
                          />
                          Use Captions
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900 truncate">
                          {segment.text ? segment.text.substring(0, 120) + (segment.text.length > 120 ? '...' : '') : 'No script added yet.'}
                        </p>
                        
                        {segment.visualPrompt && (
                          <p className="text-xs text-gray-600 truncate">
                            Visual: {segment.visualPrompt.substring(0, 80) + (segment.visualPrompt.length > 80 ? '...' : '')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                
                <button 
                  className="bg-gray-200 border border-gray-300 border-dashed rounded-lg p-4 w-full flex items-center justify-center text-sm text-gray-600 hover:bg-gray-300 hover:text-gray-900"
                  onClick={() => addSegment()}
                >
                  <PlusCircle size={16} className="mr-2" />
                  Add Segment
                </button>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Voice</h3>
              <div className="space-y-2">
                {voices.map(voice => (
                  <div 
                    key={voice.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${selectedVoice === voice.id ? 'bg-teal-100 border border-teal-500' : 'border border-gray-300'}`}
                    onClick={() => setSelectedVoice(voice.id)}
                  >
                    <div className="flex items-center">
                      <Mic size={18} className="mr-3 text-gray-900" />
                      <span className="text-gray-900">{voice.name}</span>
                    </div>
                    {selectedVoice === voice.id && (
                      <div className="h-4 w-4 rounded-full bg-teal-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-gray-100 p-6 rounded-lg shadow-md mb-6">
              <h3 className="text-lg font-bold mb-4 text-gray-900">Background Music</h3>
              <div className="space-y-2">
                {tracks.map(track => (
                  <div 
                    key={track.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${track.selected ? 'bg-teal-100 border border-teal-500' : 'border border-gray-300'}`}
                    onClick={() => setTracks(prev => 
                      prev.map(t => ({ ...t, selected: t.id === track.id }))
                    )}
                  >
                    <div className="flex items-center">
                      <Music size={18} className="mr-3 text-gray-900" />
                      <span className="text-gray-900">{track.name}</span>
                    </div>
                    {track.selected && (
                      <div className="h-4 w-4 rounded-full bg-teal-500 flex items-center justify-center">
                        <Check size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <button 
              className="btn-primary bg-teal-500 hover:bg-teal-600 text-white w-full flex items-center justify-center py-3 text-lg"
              onClick={startRendering}
              disabled={isLoading || !currentProject || !timelineSegments.some(s => s.text)}
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
          <h2 className="text-2xl font-bold text-gray-900">Processing Queue</h2>
          
          <div className="grid gap-4">
            {videoProjects.filter(p => p.status === "rendering").map(project => (
              <div key={project.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{project.title || "Untitled Project"}</h3>
                  <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs">Rendering</span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-teal-500 h-2.5 rounded-full" 
                    style={{ width: `${project.progress || renderProgress}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">{project.progress || renderProgress}% complete</span>
                  <span className="text-sm text-gray-600">ETA: ~{Math.round(((100 - (project.progress || renderProgress)) / 10))} min</span>
                </div>
              </div>
            ))}
            
            {videoProjects.filter(p => p.status === "rendering").length === 0 && (
              <div className="text-center py-12 text-gray-600">
                <RefreshCw size={40} className="mx-auto mb-4 opacity-20" />
                <p>No videos currently processing</p>
              </div>
            )}
            
            <button 
              className="btn-outline text-teal-500 border-teal-500 hover:bg-teal-500 hover:text-white w-full mt-4"
              onClick={clearQueue}
              disabled={queue.length === 0}
            >
              Clear Queue
            </button>
          </div>
        </div>
      )}
      
      {currentTab === "library" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Video Library</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videoProjects.filter(p => p.status === "ready").map(project => (
              <div key={project.id} className="bg-gray-100 overflow-hidden rounded-lg shadow-md">
                <div className="aspect-video bg-white relative group border border-gray-200">
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
                  <h3 className="font-medium mb-2 text-gray-900 truncate">{project.title || "Untitled Project"}</h3>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{new Date(project.createdAt).toLocaleDateString()}</span>
                    
                    <div className="flex space-x-2">
                      <button className="p-1.5 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300">
                        <Download size={16} />
                      </button>
                      <button className="p-1.5 rounded-lg bg-gray-200 text-gray-900 hover:bg-gray-300">
                        <Edit size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="bg-gray-100 flex flex-col items-center justify-center h-full border border-dashed border-gray-300 rounded-lg shadow-md">
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PlusCircle size={28} className="text-gray-600" />
                </div>
                <h3 className="font-medium mb-2 text-gray-900">Create New Video</h3>
                <p className="text-sm text-gray-600">Start a new video production from scratch</p>
              </div>
            </div>
            
            {videoProjects.filter(p => p.status === "ready").length === 0 && (
              <div className="text-center py-12 text-gray-600 col-span-full">
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
      
      {showPromptDropdown && (
        <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setShowPromptDropdown(false)}></div>
      )}

      {showTemplateManager && (  // Condition for rendering TemplateManager
        <TemplateManager 
          templates={savedPrompts} 
          onUpdate={(template) => {
            if (template.id) {
              setSavedPrompts(prev => prev.map(p => p.id === template.id ? template : p));
            } else {
              setSavedPrompts(prev => [...prev, { ...template, id: Date.now() }]);
            }
            setShowTemplateManager(false);
          }} 
          onClose={() => setShowTemplateManager(false)} 
        />
      )}
      
      <style jsx global>{`
        .container {
          max-width: 7xl;
          margin-left: auto;
          margin-right: auto;
          padding-left: 1rem;
          padding-right: 1rem;
        }
        .card, .bg-gray-100 {
          background: #f7fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 1.5rem;
        }
        .input {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          color: #4a5568;
        }
        .btn-primary {
          background: #0BC5B6;  /* Teal/light blue from your tailwind.config.js */
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          border: none;
          cursor: pointer;
        }
        .btn-primary:hover {
          background: #09A69A;  /* Darker teal/light blue */
        }
        .btn-outline {
          background: transparent;
          color: #0BC5B6;  /* Teal/light blue */
          border: 1px solid #0BC5B6;
          padding: 0.5rem 1rem;
          border-radius: 0.375rem;
          cursor: pointer;
        }
        .btn-outline:hover {
          background: #0BC5B6;
          color: white;
        }
        .navbar-togger {
          background-color: #fff;
        }
      `}</style>
    </div>
  );
  
  async function updateProjectTitle(videoId, newTitle) {
    try {
      await axios.patch(`${baseUrl}/api/videos/${videoId}`, {
        title: newTitle
      });
      setVideoProjects(prev => prev.map(p => p.id === videoId ? { ...p, title: newTitle } : p));
    } catch (error) {
      console.error('Error updating project title:', error);
    }
  }

  function duplicateSegment(segmentId) {
    const segment = timelineSegments.find(s => s.id === segmentId);
    const newSegment = { ...segment, id: Date.now() + Math.random().toString(36).substring(2, 9) };
    const index = timelineSegments.findIndex(s => s.id === segmentId);
    const newSegments = [...timelineSegments];
    newSegments.splice(index + 1, 0, newSegment);
    setTimelineSegments(newSegments);
    setEditingSegmentId(newSegment.id);
  }

  function applyTemplate(templateId) {
    const template = savedPrompts.find(p => p.id === templateId);
    if (template) {
      setSelectedPrompt(templateId);
      setTimelineSegments(template.structure.map(s => ({
        ...createEmptySegment(s.type),
        duration: template.slide_duration || 3,
        max_words_per_segment: template.max_words_per_segment || 8,
        captions: template.captions || false,
        aspect_ratio: template.aspect_ratio || "9:16"
      })));
      setPromptText(`Create a ${template.name} video about ${currentProject?.title || 'Untitled Video'}. Use this prompt for guidance: `);
    }
  }
}