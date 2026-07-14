"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./button";

// Define the Subject type
export type Subject = {
  name: string;
  days: string[];
  timing?: { start: string; end: string };
  requiredAttendance?: number;
  attendedClasses: number;
  totalClasses: number;
};

// Pre-defined hardcoded subjects for B.COM. SEMESTER - II (DAY) Section C - (N3)
const DEFAULT_SUBJECTS: Subject[] = [
  { name: "MACRO (Macroeconomics)", days: ["Mon", "Tue", "Wed"], timing: { start: "11:15", end: "14:45" }, requiredAttendance: 75, attendedClasses: 0, totalClasses: 0 },
  { name: "VOLSE (Life Skill Education)", days: ["Mon"], timing: { start: "13:45", end: "14:45" }, requiredAttendance: 75, attendedClasses: 0, totalClasses: 0 },
  { name: "IT (Information Technology)", days: ["Tue"], timing: { start: "11:15", end: "12:15" }, requiredAttendance: 75, attendedClasses: 0, totalClasses: 0 },
  { name: "MM&HRM (Marketing & HR)", days: ["Tue", "Wed", "Thu"], timing: { start: "12:15", end: "13:15" }, requiredAttendance: 75, attendedClasses: 0, totalClasses: 0 },
  { name: "EVS (Environmental Studies)", days: ["Wed"], timing: { start: "13:45", end: "14:45" }, requiredAttendance: 75, attendedClasses: 0, totalClasses: 0 },
  { name: "COST 1 (Cost Accounting)", days: ["Thu", "Sat"], timing: { start: "12:15", end: "14:45" }, requiredAttendance: 75, attendedClasses: 0, totalClasses: 0 },
  { name: "ENG (English)", days: ["Sat"], timing: { start: "11:15", end: "12:15" }, requiredAttendance: 75, attendedClasses: 0, totalClasses: 0 }
];

export default function Subjects() {
  const router = useRouter();
  
  // Initialize state with DEFAULT_SUBJECTS to prevent empty state
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  
  // Add state for new fields (Add Form)
  const [subjectName, setSubjectName] = useState("");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [requiredAttendance, setRequiredAttendance] = useState<string>("");
  
  // States for Edit function
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editSelectedDays, setEditSelectedDays] = useState<string[]>([]);
  const [editStartTime, setEditStartTime] = useState("");
  const [editEndTime, setEditEndTime] = useState("");
  const [editRequiredAttendance, setEditRequiredAttendance] = useState<string>("");
  const [editAttendedClasses, setEditAttendedClasses] = useState<string>("0");
  const [editTotalClasses, setEditTotalClasses] = useState<string>("0");

  // UI States
  const [attendanceError, setAttendanceError] = useState("");
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  // New state for undo tracking
  const [attendanceHistory, setAttendanceHistory] = useState<{
    index: number;
    previousAttended: number;
    previousTotal: number;
  } | null>(null);

  // Constants
  const dayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Handlers for Add Form
  function handleDayChange(day: string) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  // Handlers for Edit Form
  function handleEditDayChange(day: string) {
    setEditSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  function handleCloseEdit() {
    setIsEditing(false);
    setEditIndex(null);
  }

  // Quick Direct Update for Attendance Counts with undo support
  function updateQuickAttendance(index: number, attended: number, total: number) {
    const updated = subjects.map((sub, i) => {
      if (i === index) {
        // Store previous state for undo
        setAttendanceHistory({
          index,
          previousAttended: sub.attendedClasses,
          previousTotal: sub.totalClasses
        });
        
        return {
          ...sub,
          attendedClasses: Math.max(0, attended),
          totalClasses: Math.max(0, total)
        };
      }
      return sub;
    });
    localStorage.setItem("subjects", JSON.stringify(updated));
    setSubjects(updated);
    
    // Show undo notification
    setNotification({ 
      type: 'success', 
      message: 'Attendance updated! Click Undo to revert.' 
    });
  }

  // Undo last attendance change
  function undoAttendanceChange() {
    if (!attendanceHistory) return;
    
    const { index, previousAttended, previousTotal } = attendanceHistory;
    const updated = subjects.map((sub, i) => {
      if (i === index) {
        return {
          ...sub,
          attendedClasses: previousAttended,
          totalClasses: previousTotal
        };
      }
      return sub;
    });
    
    localStorage.setItem("subjects", JSON.stringify(updated));
    setSubjects(updated);
    setAttendanceHistory(null);
    setNotification({ 
      type: 'success', 
      message: 'Attendance change undone!' 
    });
  }

  // CRUD Functions
  function addSubject() {
    const name = subjectName.trim();
    if (!name) {
      setNotification({ type: 'error', message: 'Please enter a subject name.' });
      return;
    }
    if (requiredAttendance) {
      const percent = Number(requiredAttendance);
      if (isNaN(percent) || percent < 0 || percent > 100) {
        setAttendanceError("Attendance % must be a number between 0 and 100");
        setNotification({ type: 'error', message: 'Attendance % must be a number between 0 and 100' });
        return;
      }
      setAttendanceError("");
    }

    const newSubject: Subject = {
      name,
      days: selectedDays,
      timing: startTime && endTime ? { start: startTime, end: endTime } : undefined,
      requiredAttendance: requiredAttendance ? Number(requiredAttendance) : undefined,
      attendedClasses: 0,
      totalClasses: 0,
    };

    const updatedSubjects = [...subjects, newSubject];
    
    localStorage.setItem("subjects", JSON.stringify(updatedSubjects));
    setSubjects(updatedSubjects);
    setNotification({ type: 'success', message: 'Subject added successfully!' });
    
    // Clear form
    setSubjectName("");
    setSelectedDays([]);
    setStartTime("");
    setEndTime("");
    setRequiredAttendance("");
  }

  function removeSubject(itemIndex: number) {
    const updatedSubjects = subjects.filter((_, index) => index !== itemIndex);
    localStorage.setItem("subjects", JSON.stringify(updatedSubjects));
    setSubjects(updatedSubjects);
    
    if (editIndex === itemIndex) {
      handleCloseEdit();
    }
    setNotification({ type: 'success', message: 'Subject removed successfully!' });
  }

  function submitEditSubject(itemIndex: number) {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setNotification({ type: 'error', message: 'Subject name cannot be empty.' });
      return;
    }

    const updatedSubjects = subjects.map((subject, index) => {
      if (index === itemIndex) {
        return {
          ...subject,
          name: trimmedName,
          days: editSelectedDays,
          timing: editStartTime && editEndTime ? { start: editStartTime, end: editEndTime } : undefined,
          requiredAttendance: editRequiredAttendance ? Number(editRequiredAttendance) : undefined,
          attendedClasses: Number(editAttendedClasses) || 0,
          totalClasses: Number(editTotalClasses) || 0
        };
      }
      return subject;
    });

    localStorage.setItem("subjects", JSON.stringify(updatedSubjects));
    setSubjects(updatedSubjects);
    setNotification({ type: 'success', message: 'Subject updated successfully!' });
    handleCloseEdit();
  }

  function handleCancel() {
    if (subjectName || selectedDays.length > 0 || startTime || endTime || requiredAttendance) {
      setShowCancelModal(true);
    } else {
      setSubjectName("");
      setSelectedDays([]);
      setStartTime("");
      setEndTime("");
      setRequiredAttendance("");
    }
  }

  function confirmCancel() {
    setShowCancelModal(false);
    setSubjectName("");
    setSelectedDays([]);
    setStartTime("");
    setEndTime("");
    setRequiredAttendance("");
  }

  function closeNotification() {
    setNotification(null);
  }

  // Safely mount and synchronize state with localStorage once client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const subjectsData = localStorage.getItem("subjects");
      if (subjectsData) {
        try {
          const parsed = JSON.parse(subjectsData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSubjects(parsed);
          } else {
            // If localStorage is empty or invalid, use defaults
            localStorage.setItem("subjects", JSON.stringify(DEFAULT_SUBJECTS));
            setSubjects(DEFAULT_SUBJECTS);
          }
        } catch (e) {
          // If JSON parse fails, use defaults
          localStorage.setItem("subjects", JSON.stringify(DEFAULT_SUBJECTS));
          setSubjects(DEFAULT_SUBJECTS);
        }
      } else {
        // No data in localStorage, initialize with defaults
        localStorage.setItem("subjects", JSON.stringify(DEFAULT_SUBJECTS));
        setSubjects(DEFAULT_SUBJECTS);
      }
    }
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-[#0f172a] to-[#020617] overflow-x-hidden">
      {/* Background SVGs */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 0.13, scale: 1 }} transition={{ duration: 1.1, delay: 0.2 }} style={{ position: 'absolute', left: '8%', top: '10%', width: 22, height: 22 }}>
          <svg width="22" height="22" viewBox="0 0 48 48"><rect x="6" y="12" width="36" height="28" rx="6" fill="#6366f1" opacity="0.7" /></svg>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 0.13, scale: 1 }} transition={{ duration: 1.2, delay: 0.3 }} style={{ position: 'absolute', left: '70%', top: '10%', width: 20, height: 20 }}>
          <svg width="20" height="20" viewBox="0 0 48 48"><rect x="10" y="14" width="12" height="20" rx="3" fill="#6366f1" opacity="0.5" /><rect x="26" y="14" width="12" height="20" rx="3" fill="#38bdf8" opacity="0.5" /></svg>
        </motion.div>
        <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 0.13, scale: 1 }} transition={{ duration: 1.3, delay: 0.4 }} style={{ position: 'absolute', left: '18%', top: '18%', width: 18, height: 18 }}>
          <svg width="18" height="18" viewBox="0 0 48 48"><circle cx="24" cy="24" r="9" fill="#38bdf8" opacity="0.7" /><path d="M24 20v5l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </motion.div>
      </div>

      <motion.div className="flex flex-col items-center justify-center my-8 md:my-10 min-h-auto z-10 w-full">
        {/* Add Subject Form */}
        <motion.form
          className="glass bg-gradient-to-br from-[#232a3a] to-[#232a3a]/80 rounded-2xl p-4 sm:p-8 shadow-2xl w-full max-w-lg flex flex-col gap-4 sm:gap-5 border border-[#232a3a] backdrop-blur-md"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onSubmit={e => { e.preventDefault(); addSubject(); }}
        >
          <motion.label className="text-white font-semibold">Subject Name<span className="text-red-400">*</span></motion.label>
          <motion.input
            type="text"
            value={subjectName}
            onChange={e => setSubjectName(e.target.value)}
            placeholder="Enter subject name"
            className="rounded-lg p-3 bg-[#181c25] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-[#38bdf8] text-lg shadow-inner"
          />
          
          <motion.label className="text-white font-semibold mt-2">Class Days</motion.label>
          <div className="flex flex-wrap gap-2">
            {dayOptions.map(day => (
              <label key={day} className={`flex items-center gap-1 text-white px-3 py-1 rounded-full cursor-pointer border transition-all duration-200 ${selectedDays.includes(day) ? 'bg-gradient-to-r from-[#6366f1] to-[#38bdf8] border-[#38bdf8] shadow' : 'bg-[#232a3a] border-[#6366f1]'}`}>
                <input type="checkbox" checked={selectedDays.includes(day)} onChange={() => handleDayChange(day)} className="hidden" />
                {day}
              </label>
            ))}
          </div>

          <motion.label className="text-white font-semibold mt-2">Class Timing <span className="text-gray-400 text-xs">(optional)</span></motion.label>
          <div className="flex gap-2">
            <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="rounded-lg p-2 bg-[#181c25] text-white border border-gray-600 focus:outline-none w-32" />
            <span className="text-white pt-2">-</span>
            <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="rounded-lg p-2 bg-[#181c25] text-white border border-gray-600 focus:outline-none w-32" />
          </div>

          <motion.label className="text-white font-semibold mt-2">Required Attendance % <span className="text-gray-400 text-xs">(optional)</span></motion.label>
          <input type="number" min={0} max={100} value={requiredAttendance} onChange={e => setRequiredAttendance(e.target.value)} placeholder="e.g. 75" className="rounded-lg p-2 bg-[#181c25] text-white border border-gray-600 focus:outline-none w-32" />
          
          {attendanceError && <span className="text-red-400 text-xs mt-1">{attendanceError}</span>}

          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-4 w-full">
            <Button onClick={addSubject} content="Add Subject" />
            <Button onClick={handleCancel} content="Cancel" />
          </div>
        </motion.form>

        {/* Notifications and Modals */}
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="fixed top-6 left-1/2 z-50 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-white font-semibold flex items-center gap-4" style={{ background: notification.type === 'success' ? 'linear-gradient(to right, #22c55e, #38bdf8)' : 'linear-gradient(to right, #ef4444, #ec4899)' }}>
              <span>{notification.message}</span>
              {attendanceHistory && (
                <button 
                  onClick={undoAttendanceChange}
                  className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-sm font-bold transition-all"
                >
                  ↩ Undo
                </button>
              )}
              <button onClick={closeNotification} className="ml-2 hover:opacity-80">✕</button>
            </motion.div>
          )}
          {showCancelModal && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div className="bg-[#181c25] rounded-2xl p-8 shadow-2xl border border-[#232a3a] flex flex-col items-center gap-4" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
                <div className="text-white text-lg font-semibold mb-2">Discard changes?</div>
                <div className="text-gray-400 mb-4">You have unsaved changes. Are you sure you want to cancel?</div>
                <div className="flex gap-4">
                  <Button onClick={confirmCancel} content="Yes, Discard" />
                  <Button onClick={() => setShowCancelModal(false)} content="No, Keep Editing" />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Subject List */}
      <motion.div className="flex flex-col items-center justify-start min-h-screen z-10 w-full mb-20">
        <motion.h1 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#38bdf8] to-[#22c55e] bg-clip-text text-transparent drop-shadow-lg">
          Subjects
        </motion.h1>

        <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 w-full max-w-xs sm:max-w-2xl lg:max-w-6xl px-2 sm:px-0">
          {subjects.map((subject, index) => {
            const currentPercent = subject.totalClasses > 0 ? Math.round((subject.attendedClasses / subject.totalClasses) * 100) : 0;
            
            return (
              <motion.div key={index} className="relative glass rounded-3xl shadow-2xl p-4 sm:p-7 border border-[#232a3a] bg-gradient-to-br from-[#232a3a]/80 to-[#232a3a]/60 backdrop-blur-xl transition-all group min-h-[220px] flex flex-col justify-between" style={{ boxShadow: "0 4px 32px 0 rgba(99,102,241,0.13)" }}>
                
                {/* Close Edit Button */}
                {isEditing && editIndex === index && (
                  <button onClick={handleCloseEdit} className="absolute top-2 right-4 text-gray-500 hover:text-red-500 text-3xl font-bold focus:outline-none z-10">&times;</button>
                )}

                {/* Edit Mode vs Display Mode */}
                {isEditing && editIndex === index ? (
                  <div className="flex flex-col gap-3 mt-4">
                    <input type="text" className="border border-[#38bdf8] rounded-lg px-3 py-2 w-full focus:outline-none bg-[#181c25] text-white font-semibold" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Subject name" />
                    
                    {/* Edit Days */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dayOptions.map(day => (
                        <label key={day} className={`text-xs px-2 py-1 rounded cursor-pointer border ${editSelectedDays.includes(day) ? 'bg-[#38bdf8] text-[#181c25] border-[#38bdf8]' : 'bg-[#232a3a] text-white border-gray-600'}`}>
                          <input type="checkbox" checked={editSelectedDays.includes(day)} onChange={() => handleEditDayChange(day)} className="hidden" />
                          {day}
                        </label>
                      ))}
                    </div>

                    {/* Edit Timing */}
                    <div className="flex gap-2 items-center mt-1">
                      <input type="time" value={editStartTime} onChange={e => setEditStartTime(e.target.value)} className="rounded p-1 bg-[#181c25] text-white border border-gray-600 text-xs focus:outline-none w-24" />
                      <span className="text-white text-xs">-</span>
                      <input type="time" value={editEndTime} onChange={e => setEditEndTime(e.target.value)} className="rounded p-1 bg-[#181c25] text-white border border-gray-600 text-xs focus:outline-none w-24" />
                    </div>

                    {/* Edit Attendance Percent */}
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-white text-xs">Required %:</span>
                       <input type="number" min={0} max={100} value={editRequiredAttendance} onChange={e => setEditRequiredAttendance(e.target.value)} placeholder="75" className="rounded p-1 bg-[#181c25] text-white border border-gray-600 text-xs focus:outline-none w-16" />
                    </div>

                    {/* Edit Previous Logged History Data */}
                    <div className="grid grid-cols-2 gap-2 mt-1 bg-[#181c25]/50 p-2 rounded-lg border border-gray-700">
                      <div>
                        <span className="text-gray-400 text-[10px] block mb-1">Attended Classes</span>
                        <input type="number" min={0} value={editAttendedClasses} onChange={e => setEditAttendedClasses(e.target.value)} className="rounded p-1 bg-[#181c25] text-white border border-gray-600 text-xs focus:outline-none w-full" />
                      </div>
                      <div>
                        <span className="text-gray-400 text-[10px] block mb-1">Total Conducted</span>
                        <input type="number" min={0} value={editTotalClasses} onChange={e => setEditTotalClasses(e.target.value)} className="rounded p-1 bg-[#181c25] text-white border border-gray-600 text-xs focus:outline-none w-full" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Display Mode */}
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <h2 className="text-xl font-extrabold text-white bg-gradient-to-r from-[#6366f1] via-[#38bdf8] to-[#22c55e] bg-clip-text text-transparent drop-shadow-lg flex-1 truncate">{subject.name}</h2>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {subject.days && subject.days.length > 0 && subject.days.map(day => (
                          <span key={day} className="px-3 py-1 rounded-full bg-gradient-to-r from-[#6366f1] to-[#22c55e] text-white text-xs font-semibold shadow border border-[#232a3a]">{day}</span>
                        ))}
                      </div>
                      
                      <div className="flex flex-col gap-1 mb-3">
                        {subject.timing && (
                          <div className="flex items-center gap-2 text-sm text-[#38bdf8] font-medium">
                            <svg width="18" height="18" viewBox="0 0 48 48" className="inline-block"><circle cx="24" cy="24" r="9" fill="#38bdf8" opacity="0.7" /><path d="M24 20v5l3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            <span>{subject.timing.start} - {subject.timing.end}</span>
                          </div>
                        )}
                        {typeof subject.requiredAttendance === 'number' && (
                          <div className="flex items-center gap-2 text-xs text-[#22c55e] font-semibold">
                            <svg width="16" height="16" viewBox="0 0 48 48" className="inline-block"><circle cx="24" cy="24" r="7" fill="#22c55e" opacity="0.7" /><path d="M18 24l4 4 6-7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" /></svg>
                            <span>🎯 Target: {subject.requiredAttendance}% | Current: <span className={currentPercent >= subject.requiredAttendance ? "text-green-400" : "text-amber-400"}>{currentPercent}%</span></span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Access Tracker Logs Counter Box */}
                    <div className="bg-[#181c25]/70 p-3 rounded-xl border border-gray-700/60 my-2 flex items-center justify-between gap-2">
                      <div className="text-xs text-gray-300">
                        Log: <strong className="text-white">{subject.attendedClasses}</strong> / {subject.totalClasses} classes
                      </div>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => updateQuickAttendance(index, subject.attendedClasses + 1, subject.totalClasses + 1)} 
                          className="bg-green-600/30 hover:bg-green-600/50 text-green-400 text-xs px-2 py-1 rounded font-bold border border-green-500/30"
                          title="Mark as attended"
                        >
                          + Attended
                        </button>
                        <button 
                          onClick={() => updateQuickAttendance(index, subject.attendedClasses, subject.totalClasses + 1)} 
                          className="bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs px-2 py-1 rounded font-bold border border-red-500/20"
                          title="Mark as missed"
                        >
                          + Missed
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex flex-row justify-between items-center mt-auto pt-4 gap-2">
                  <Button onClick={() => removeSubject(index)} content="Remove" />
                  {isEditing && editIndex === index ? (
                    <Button onClick={() => submitEditSubject(index)} content="Save" />
                  ) : (
                    <Button
                      onClick={() => {
                        setIsEditing(true);
                        setEditIndex(index);
                        setEditName(subject.name);
                        setEditSelectedDays(subject.days || []);
                        setEditStartTime(subject.timing?.start || "");
                        setEditEndTime(subject.timing?.end || "");
                        setEditRequiredAttendance(subject.requiredAttendance !== undefined ? subject.requiredAttendance.toString() : "");
                        setEditAttendedClasses(subject.attendedClasses.toString());
                        setEditTotalClasses(subject.totalClasses.toString());
                      }}
                      content="Edit"
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
