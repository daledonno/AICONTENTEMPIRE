// app/create/page.js
'use client';

import { useState } from 'react';
import { 
  Feather, 
  Layout, 
  List, 
  Sliders, 
  Download, 
  Save,
  Copy,
  RefreshCw,
  BookOpen,
  Undo,
  Redo,
  PlusCircle,
  ChevronDown,
  Monitor,
  Smartphone
} from 'lucide-react';

export default function ContentCreator() {
  const [showTemplates, setShowTemplates] = useState(false);
  const [activeTab, setActiveTab] = useState('script');
  
  // Sample script
  const scriptContent = `# AI Image Generation: 5 Mind-Blowing Tools

**HOOK:** 
What if I told you that you could create stunning artwork, photorealistic images, and creative visuals without any design skills? In this video, I'll show you 5 AI image generators that are changing the game.

**INTRO:**
AI image generation has exploded in the past year. From DALL-E to Midjourney, the quality and capabilities keep improving. Let's dive into the 5 tools you need to know about.

**BODY:**

1. Midjourney
   - Known for: Artistic quality and aesthetics
   - Best for: Creating illustrations, concept art, and stylized images
   - Pricing: $10-30/month depending on usage
   - Example prompt: "A cyberpunk city at sunset with neon signs and flying cars, cinematic lighting, detailed"

2. DALL-E 3
   - Known for: Following complex instructions accurately
   - Best for: Precise control over image elements
   - Pricing: Credits-based system via OpenAI
   - Example prompt: "A cozy modern home office with a wooden desk, ergonomic chair, laptop, coffee mug, and a plant by the window with sunlight coming in"

3. Stable Diffusion
   - Known for: Open-source flexibility and customization
   - Best for: Self-hosting and fine-tuning to your needs
   - Pricing: Free (if self-hosted)
   - Example prompt: "Portrait photo of a highland warrior, tribal face paint, blue woad, cinematic, detailed, 8k"

4. Leonardo.AI
   - Known for: User-friendly interface and training on your own images
   - Best for: Creating consistent assets and characters
   - Pricing: Free tier available, Pro from $10/month
   - Example prompt: "Product photo of a sleek smartwatch with a black band on a minimalist white surface, studio lighting, professional photography"

5. Imagen
   - Known for: Photorealism and text rendering
   - Best for: Creating realistic product mockups
   - Pricing: Available through Google Cloud
   - Example prompt: "An ultra-detailed photograph of a transparent glass smartphone concept with visible internal components, on a black background with dramatic lighting"

**CONCLUSION:**
These AI image generators are revolutionizing creative workflows. Whether you're a marketer, content creator, or just someone who wants to experiment, these tools can save you time and unlock new possibilities.

**CALL TO ACTION:**
Which of these AI image generators are you most excited to try? Let me know in the comments. And don't forget to like and subscribe for more AI tool breakdowns!`;

  // Sample templates
  const templates = [
    { id: 1, name: 'Tutorial Format', description: 'Step-by-step guide for teaching a skill' },
    { id: 2, name: 'Tool Review', description: 'In-depth analysis of software or AI tools' },
    { id: 3, name: 'News & Analysis', description: 'Breaking down recent AI developments' },
    { id: 4, name: 'Problem-Solution', description: 'Addressing pain points with AI solutions' },
    { id: 5, name: 'Top 5 List', description: 'Curated list of best tools or techniques' },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Content Creator Studio</h1>
        <div className="flex space-x-3">
          <button className="btn-outline flex items-center">
            <Save size={16} className="mr-2" />
            Save Draft
          </button>
          <button className="btn-primary flex items-center">
            <Download size={16} className="mr-2" />
            Export
          </button>
        </div>
      </div>
      
      {/* Editor header */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-grow">
            <input 
              type="text" 
              defaultValue="AI Image Generation: 5 Mind-Blowing Tools"
              placeholder="Enter content title..." 
              className="input text-lg font-bold w-full"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              className="btn-outline flex items-center"
              onClick={() => setShowTemplates(!showTemplates)}
            >
              <Layout size={16} className="mr-2" />
              Templates
            </button>
            
            <button className="btn-outline flex items-center">
              <Sliders size={16} className="mr-2" />
              Settings
            </button>
          </div>
        </div>
      </div>
      
      {/* Template selector (conditionally shown) */}
      {showTemplates && (
        <div className="card mb-6">
          <h3 className="font-bold mb-3">Content Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map(template => (
              <div 
                key={template.id} 
                className="border border-gray-700 rounded-lg p-3 hover:bg-gray-700 cursor-pointer"
              >
                <h4 className="font-bold">{template.name}</h4>
                <p className="text-sm text-gray-400">{template.description}</p>
              </div>
            ))}
            <div className="border border-dashed border-gray-600 rounded-lg p-3 hover:bg-gray-700 cursor-pointer flex items-center justify-center">
              <PlusCircle size={16} className="mr-2" />
              <span>Create Custom Template</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Editor tabs */}
      <div className="card mb-6">
        <div className="flex border-b border-gray-700 mb-4">
          <button 
            className={`px-4 py-2 flex items-center ${activeTab === 'script' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('script')}
          >
            <Feather size={16} className="mr-2" />
            Script
          </button>
          <button 
            className={`px-4 py-2 flex items-center ${activeTab === 'outline' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('outline')}
          >
            <List size={16} className="mr-2" />
            Outline
          </button>
          <button 
            className={`px-4 py-2 flex items-center ${activeTab === 'preview' ? 'border-b-2 border-purple-500 text-white' : 'text-gray-400'}`}
            onClick={() => setActiveTab('preview')}
          >
            <BookOpen size={16} className="mr-2" />
            Preview
          </button>
        </div>
        
        {/* Editor toolbar */}
        <div className="flex items-center gap-2 mb-3">
          <button className="btn-outline py-1 px-2">
            <Undo size={16} />
          </button>
          <button className="btn-outline py-1 px-2">
            <Redo size={16} />
          </button>
          <div className="h-6 border-r border-gray-600 mx-1"></div>
          <select className="input py-1 px-2 text-sm">
            <option>Normal</option>
            <option>Heading 1</option>
            <option>Heading 2</option>
            <option>Heading 3</option>
          </select>
          <div className="h-6 border-r border-gray-600 mx-1"></div>
          <button className="btn-outline py-1 px-2">
            <Copy size={16} />
          </button>
          <button className="btn-outline py-1 px-2 flex items-center">
            <RefreshCw size={16} className="mr-1" />
            <span>Regenerate</span>
          </button>
          <div className="flex-grow"></div>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded text-gray-400 hover:bg-gray-700">
              <Monitor size={16} />
            </button>
            <button className="p-1 rounded text-gray-400 hover:bg-gray-700">
              <Smartphone size={16} />
            </button>
          </div>
        </div>
        
        {/* Editor content */}
        <textarea 
          className="input w-full h-96 font-mono text-sm"
          value={scriptContent}
          onChange={() => {}}
        ></textarea>
        
        {/* AI assistance area */}
        <div className="mt-6 border-t border-gray-700 pt-4">
          <h3 className="font-bold mb-2">AI Assistance</h3>
          <div className="flex flex-col md:flex-row gap-3">
            <button className="btn-outline flex-grow py-2 text-sm flex items-center justify-center">
              <span>Improve Hooks & Intro</span>
            </button>
            <button className="btn-outline flex-grow py-2 text-sm flex items-center justify-center">
              <span>Generate Examples</span>
            </button>
            <button className="btn-outline flex-grow py-2 text-sm flex items-center justify-center">
              <span>Strengthen Call to Action</span>
            </button>
            <button className="btn-outline flex-grow py-2 text-sm flex items-center justify-center">
              <span>Custom Instruction</span>
              <ChevronDown size={14} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Related content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-bold mb-3">Related Trends</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-700">
              <div>
                <h4>AI Image Prompt Engineering</h4>
                <p className="text-sm text-gray-400">+68% growth in searches</p>
              </div>
              <button className="btn-outline text-xs py-1">Add to Script</button>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-700">
              <div>
                <h4>AI Image Tools for Marketing</h4>
                <p className="text-sm text-gray-400">+52% growth in searches</p>
              </div>
              <button className="btn-outline text-xs py-1">Add to Script</button>
            </div>
            <div className="flex items-center justify-between p-2 rounded hover:bg-gray-700">
              <div>
                <h4>Free vs Paid AI Image Tools</h4>
                <p className="text-sm text-gray-400">+47% growth in searches</p>
              </div>
              <button className="btn-outline text-xs py-1">Add to Script</button>
            </div>
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-bold mb-3">Batch Operations</h3>
          <p className="text-gray-400 mb-4">Create variations or related content based on this script.</p>
          <div className="space-y-3">
            <button className="btn-outline w-full text-left flex items-center justify-between">
              <span>Create 3 title variations</span>
              <PlusCircle size={16} />
            </button>
            <button className="btn-outline w-full text-left flex items-center justify-between">
              <span>Generate 5 thumbnail concepts</span>
              <PlusCircle size={16} />
            </button>
            <button className="btn-outline w-full text-left flex items-center justify-between">
              <span>Convert to YouTube shorts format</span>
              <PlusCircle size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}