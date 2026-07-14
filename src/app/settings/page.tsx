"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SettingsPage() {
  const router = useRouter();
  const hasMounted = useRef(false);
  
  // Settings states
  const [defaultAttendancePercentage, setDefaultAttendancePercentage] = useState("75");
  const [theme, setTheme] = useState("dark");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [course, setCourse] = useState("");
  
  // UI states
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [resetTimer, setResetTimer] = useState(5);
  const [isResetting, setIsResetting] = useState(false);

  // Load settings on mount
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      
      // Load all settings from localStorage
      const savedDefault = localStorage.getItem("defaultAttendancePercentage");
      const savedTheme = localStorage.getItem("theme");
      const savedNotifications = localStorage.getItem("notificationsEnabled");
      const savedSemester = localStorage.getItem("semester");
      const savedSection = localStorage.getItem("section");
      const savedCourse = localStorage.getItem("course");
      
      if (savedDefault) setDefaultAttendancePercentage(savedDefault);
      if (savedTheme) setTheme(savedTheme);
      if (savedNotifications !== null) setNotificationsEnabled(savedNotifications === "true");
      if (savedSemester) setSemester(savedSemester);
      if (savedSection) setSection(savedSection);
      if (savedCourse) setCourse(savedCourse);
    }
  }, []);

  // Perform reset function (memoized with useCallback to fix dependency warning)
  const performReset = useCallback(() => {
    // Keep user data but clear all other data
    const userData = localStorage.getItem("user");
    localStorage.clear();
    
    // Restore user data if it existed
    if (userData) {
      localStorage.setItem("user", userData);
    }
    
    setShowConfirmReset(false);
    setIsResetting(false);
    setResetTimer(5);
    
    // Reset form fields
    setDefaultAttendancePercentage("75");
    setTheme("dark");
    setNotificationsEnabled(true);
    setSemester("");
    setSection("");
    setCourse("");
    
    alert("All data has been reset. You&apos;ll be redirected to the landing page.");
    setTimeout(() => router.push("/landing"), 1500);
  }, [router]);

  // Countdown timer for reset
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isResetting && resetTimer > 0) {
      timer = setInterval(() => {
        setResetTimer(prev => prev - 1);
      }, 1000);
    } else if (resetTimer === 0) {
      performReset();
    }
    return () => clearInterval(timer);
  }, [isResetting, resetTimer, performReset]);

  // Save individual setting
  const saveSetting = (key: string, value: string) => {
    localStorage.setItem(key, value);
    showSaveMessage();
  };

  const showSaveMessage = () => {
    setSaveMessage("✓ Settings saved successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Save all settings
    localStorage.setItem("defaultAttendancePercentage", defaultAttendancePercentage);
    localStorage.setItem("theme", theme);
    localStorage.setItem("notificationsEnabled", notificationsEnabled.toString());
    localStorage.setItem("semester", semester);
    localStorage.setItem("section", section);
    localStorage.setItem("course", course);
    
    setSaveMessage("✓ All settings saved successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleReset = () => {
    setShowConfirmReset(true);
    setIsResetting(true);
    setResetTimer(5);
  };

  const cancelReset = () => {
    setShowConfirmReset(false);
    setIsResetting(false);
    setResetTimer(5);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/landing");
  };

  const handleExportData = () => {
    const subjects = localStorage.getItem("subjects");
    const settings = {
      defaultAttendancePercentage,
      theme,
      notificationsEnabled,
      semester,
      section,
      course
    };
    
    const exportData = {
      subjects: subjects ? JSON.parse(subjects) : [],
      settings: settings,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    setSaveMessage("✓ Data exported successfully!");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 py-8 sm:py-12 bg-gradient-to-b from-[#0f172a] to-[#020617] overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.7 }} 
          animate={{ opacity: 0.1, scale: 1 }} 
          transition={{ duration: 1.1, delay: 0.2 }} 
          className="absolute left-[10%] top-[20%] w-32 h-32 rounded-full bg-gradient-to-r from-[#6366f1] to-[#38bdf8] blur-3xl" 
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.7 }} 
          animate={{ opacity: 0.1, scale: 1 }} 
          transition={{ duration: 1.2, delay: 0.3 }} 
          className="absolute right-[15%] bottom-[30%] w-40 h-40 rounded-full bg-gradient-to-r from-[#22c55e] to-[#38bdf8] blur-3xl" 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="w-full max-w-2xl z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-[#6366f1] via-[#38bdf8] to-[#22c55e] bg-clip-text text-transparent drop-shadow-lg">
            Settings
          </h1>
          <p className="text-gray-400">Customize your attendance tracking experience</p>
        </div>

        {/* Save Message Toast */}
        <AnimatePresence>
          {saveMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 p-3 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-xl text-white text-center"
            >
              {saveMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Academic Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gradient-to-br from-[#232a3a] to-[#1a1f2e] rounded-2xl p-6 sm:p-8 mb-6 border border-[#232a3a]"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>📚</span> Academic Info
          </h2>
          
          <form onSubmit={handleSaveAll} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">Course</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#181c25] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-all"
                  placeholder="e.g., B.COM"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Semester</label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#181c25] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-all"
                  placeholder="e.g., Semester II"
                />
              </div>
              <div>
                <label className="block text-white text-sm font-medium mb-2">Section</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#181c25] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-all"
                  placeholder="e.g., Section C (N3)"
                />
              </div>
            </div>
          </form>
        </motion.div>

        {/* Attendance Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-[#232a3a] to-[#1a1f2e] rounded-2xl p-6 sm:p-8 mb-6 border border-[#232a3a]"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>⚙️</span> Attendance Preferences
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Default Required Attendance (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={defaultAttendancePercentage}
                onChange={(e) => {
                  setDefaultAttendancePercentage(e.target.value);
                  saveSetting("defaultAttendancePercentage", e.target.value);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-[#181c25] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-all"
                placeholder="75"
              />
              <p className="text-gray-500 text-xs mt-1">This will be the default requirement for new subjects</p>
            </div>

            <div>
              <label className="block text-white text-sm font-medium mb-2">Theme</label>
              <select
                value={theme}
                onChange={(e) => {
                  setTheme(e.target.value);
                  saveSetting("theme", e.target.value);
                }}
                className="w-full px-4 py-2.5 rounded-xl bg-[#181c25] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] transition-all"
              >
                <option value="dark">Dark (Default)</option>
                <option value="darker">Darker</option>
                <option value="midnight">Midnight Blue</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white text-sm font-medium">Notifications</label>
                <p className="text-gray-500 text-xs">Get alerts for low attendance</p>
              </div>
              <button
                onClick={() => {
                  setNotificationsEnabled(!notificationsEnabled);
                  saveSetting("notificationsEnabled", (!notificationsEnabled).toString());
                }}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                  notificationsEnabled ? 'bg-gradient-to-r from-[#22c55e] to-[#38bdf8]' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-transform duration-200 ${
                    notificationsEnabled ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gradient-to-br from-[#232a3a] to-[#1a1f2e] rounded-2xl p-6 sm:p-8 mb-6 border border-[#232a3a]"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span>🔧</span> Actions
          </h2>

          <div className="space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSaveAll}
              className="w-full rounded-xl px-6 py-3 text-white font-semibold bg-gradient-to-r from-[#6366f1] to-[#22c55e] shadow-lg hover:shadow-xl transition-all"
            >
              💾 Save All Settings
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportData}
              className="w-full rounded-xl px-6 py-3 text-white font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 shadow-lg hover:shadow-xl transition-all"
            >
              📥 Export Data Backup
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="w-full rounded-xl px-6 py-3 text-white font-semibold bg-gradient-to-r from-red-500 to-pink-500 shadow-lg hover:shadow-xl transition-all"
            >
              🔄 Reset All Data
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowConfirmLogout(true)}
              className="w-full rounded-xl px-6 py-3 bg-yellow-500/20 text-yellow-400 font-semibold border border-yellow-500/30 hover:bg-yellow-500/30 transition-all"
            >
              🚪 Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center text-gray-500 text-sm"
        >
          <p>Version 1.0.0 | Built with ❤️</p>
          <p className="mt-1">Your data is stored locally on your device</p>
        </motion.div>
      </motion.div>

      {/* Reset Confirmation Modal */}
      <AnimatePresence>
        {showConfirmReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#232a3a] to-[#1a1f2e] rounded-2xl p-8 max-w-md mx-4 border border-[#232a3a]"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-xl font-bold text-white mb-2">Reset All Data?</h3>
                <p className="text-gray-400">
                  This will clear all your subjects, attendance records, and settings.
                  {isResetting && (
                    <span className="block mt-2 text-red-400 font-semibold">
                      Resetting in {resetTimer} seconds...
                    </span>
                  )}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={cancelReset}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={performReset}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-all"
                >
                  Reset Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showConfirmLogout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-[#232a3a] to-[#1a1f2e] rounded-2xl p-8 max-w-md mx-4 border border-[#232a3a]"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">👋</div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to Leave?</h3>
                <p className="text-gray-400">
                  You&apos;ll be logged out and redirected to the landing page.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmLogout(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-600 text-white font-semibold hover:bg-gray-700 transition-all"
                >
                  Stay
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-yellow-500 text-black font-semibold hover:bg-yellow-600 transition-all"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
