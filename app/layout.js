// app/layout.js
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import "./globals.css";

// Import Inter font
import { Inter } from "next/font/google";

// Import icons from lucide-react
import {
  PanelLeft,
  Compass,
  Feather,
  Video,
  Calendar,
  BarChart2,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  ChevronDown,
  User,
} from "lucide-react";

// Initialize the Inter font
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  // Profiles for the account switcher
  const profiles = [
    { id: 1, name: "Main Account", avatar: "/api/placeholder/40/40" },
    { id: 2, name: "Business Profile", avatar: "/api/placeholder/40/40" },
    { id: 3, name: "Personal Blog", avatar: "/api/placeholder/40/40" },
  ];

  const [activeProfile, setActiveProfile] = useState(profiles[0]);

  // Toggle dark/light mode
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // This would typically save the preference to localStorage as well
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("light-mode");
    }
  };

  // Apply theme class on component mount
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (darkMode) {
        document.documentElement.classList.remove("light-mode");
      } else {
        document.documentElement.classList.add("light-mode");
      }
    }
  }, [darkMode]);

  const navItems = [
    { name: "Dashboard", path: "/", icon: <PanelLeft size={20} /> },
    { name: "Trend Discovery", path: "/trends", icon: <Compass size={20} /> },
    { name: "Content Creator", path: "/create", icon: <Feather size={20} /> },
    { name: "Video Production", path: "/produce", icon: <Video size={20} /> },
    {
      name: "Content Calendar",
      path: "/calendar",
      icon: <Calendar size={20} />,
    },
    {
      name: "Performance",
      path: "/performance",
      icon: <BarChart2 size={20} />,
    },
  ];

  return (
    <html lang="en" className={inter.className}>
      <head>
        <title>AI Content Authority Builder</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${
          darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-900"
        }`}
      >
        <div className="flex min-h-screen">
          {/* Sidebar */}
          <div
            className={`${collapsed ? "w-16" : "w-64"} ${
              darkMode ? "bg-gray-800" : "bg-white border-r border-gray-200"
            } min-h-screen fixed left-0 transition-all duration-300 ease-in-out z-10`}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              {!collapsed && (
                <span className="text-xl font-bold text-purple-500">
                  AI Authority
                </span>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="p-1 rounded-md hover:bg-gray-700"
              >
                {collapsed ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )}
              </button>
            </div>

            {/* Profile section */}
            <div className={`mt-4 relative ${collapsed ? "px-2" : "px-4"}`}>
              <div
                className={`flex items-center ${
                  collapsed ? "justify-center" : "justify-between"
                } p-2 rounded-lg hover:bg-gray-700 cursor-pointer`}
                onClick={() =>
                  !collapsed && setProfileMenuOpen(!profileMenuOpen)
                }
              >
                <div className="flex items-center">
                  <img
                    src={activeProfile.avatar}
                    alt="Profile"
                    className="w-10 h-10 rounded-full bg-purple-200"
                  />
                  {!collapsed && (
                    <div className="ml-3">
                      <div className="font-medium">{activeProfile.name}</div>
                      <div className="text-xs text-gray-400">
                        Switch Profile
                      </div>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </div>

              {/* Profile dropdown menu */}
              {profileMenuOpen && !collapsed && (
                <div className="absolute left-0 right-0 mt-1 mx-4 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-10">
                  {profiles.map((profile) => (
                    <div
                      key={profile.id}
                      className={`flex items-center p-3 hover:bg-gray-700 cursor-pointer ${
                        profile.id === activeProfile.id ? "bg-gray-700" : ""
                      }`}
                      onClick={() => {
                        setActiveProfile(profile);
                        setProfileMenuOpen(false);
                      }}
                    >
                      <img
                        src={profile.avatar}
                        alt={profile.name}
                        className="w-8 h-8 rounded-full bg-purple-200"
                      />
                      <div className="ml-3">
                        <div className="font-medium">{profile.name}</div>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-gray-700 p-2">
                    <button className="w-full text-left text-sm p-2 rounded hover:bg-gray-700 flex items-center">
                      <User size={14} className="mr-2" />
                      Manage Profiles
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-2 border-b border-gray-700 pb-4"></div>

            <nav className="mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    flex items-center p-4 hover:bg-gray-700 transition-colors
                    ${
                      pathname === item.path
                        ? "bg-purple-900 bg-opacity-50 border-l-4 border-purple-500"
                        : ""
                    }
                    ${collapsed ? "justify-center" : "justify-start"}
                  `}
                >
                  <span>{item.icon}</span>
                  {!collapsed && <span className="ml-3">{item.name}</span>}
                </Link>
              ))}
            </nav>

            {/* Theme toggle button at bottom of sidebar */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-full ${collapsed ? "" : "mx-4"} ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>

          {/* Main content */}
          <div
            className={`${
              collapsed ? "ml-16" : "ml-64"
            } flex-1 p-8 transition-all duration-300 ease-in-out`}
          >
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
