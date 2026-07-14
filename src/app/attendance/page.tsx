"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Define the Subject type (should match your subjects page)
type Subject = {
  name: string;
  days: string[];
  timing?: { start: string; end: string };
  requiredAttendance?: number;
  attendedClasses: number;
  totalClasses: number;
};

export default function AttendanceOverview() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const subjectsData = localStorage.getItem("subjects");
      if (subjectsData) {
        try {
          const parsed = JSON.parse(subjectsData);
          if (Array.isArray(parsed)) {
            setSubjects(parsed);
          }
        } catch {
          console.error("Failed to parse subjects data");
        }
      }
      setIsLoading(false);
    }
  }, []);

  // Calculate overall statistics
  const totalAttended = subjects.reduce((sum, sub) => sum + sub.attendedClasses, 0);
  const totalClasses = subjects.reduce((sum, sub) => sum + sub.totalClasses, 0);
  const overallPercentage = totalClasses > 0 ? Math.round((totalAttended / totalClasses) * 100) : 0;

  // Calculate subject-wise statistics
  const subjectStats = subjects.map(subject => ({
    ...subject,
    percentage: subject.totalClasses > 0 
      ? Math.round((subject.attendedClasses / subject.totalClasses) * 100) 
      : 0,
    status: getAttendanceStatus(
      subject.totalClasses > 0 
        ? Math.round((subject.attendedClasses / subject.totalClasses) * 100) 
        : 0,
      subject.requiredAttendance || 75
    )
  }));

  function getAttendanceStatus(percentage: number, required: number) {
    if (percentage >= required + 10) return { label: "Excellent", color: "text-green-400", bgColor: "bg-green-400/10", borderColor: "border-green-400/30" };
    if (percentage >= required) return { label: "Safe", color: "text-blue-400", bgColor: "bg-blue-400/10", borderColor: "border-blue-400/30" };
    if (percentage >= required - 10) return { label: "Warning", color: "text-yellow-400", bgColor: "bg-yellow-400/10", borderColor: "border-yellow-400/30" };
    return { label: "Danger", color: "text-red-400", bgColor: "bg-red-400/10", borderColor: "border-red-400/30" };
  }

  const getOverallStatus = () => {
    if (overallPercentage >= 85) return { label: "Excellent", color: "from-green-400 to-emerald-400" };
    if (overallPercentage >= 75) return { label: "Good", color: "from-blue-400 to-cyan-400" };
    if (overallPercentage >= 65) return { label: "Fair", color: "from-yellow-400 to-orange-400" };
    return { label: "Poor", color: "from-red-400 to-pink-400" };
  };

  const overallStatus = getOverallStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f172a] to-[#020617]">
        <div className="text-white text-xl">Loading attendance data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f172a] to-[#020617] text-white p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-[#6366f1] via-[#38bdf8] to-[#22c55e] bg-clip-text text-transparent drop-shadow-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Attendance Overview
          </motion.h1>
          <p className="text-gray-400 text-lg">Track your academic attendance progress</p>
        </div>

        {/* Overall Statistics Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gradient-to-br from-[#232a3a] to-[#1a1f2e] rounded-3xl p-6 sm:p-8 mb-8 border border-[#232a3a] shadow-2xl"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Overall Attendance</h2>
            <p className={`text-4xl sm:text-5xl font-extrabold bg-gradient-to-r ${overallStatus.color} bg-clip-text text-transparent`}>
              {overallPercentage}%
            </p>
            <p className="text-gray-400 mt-2">
              {totalAttended} attended out of {totalClasses} total classes
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#0f172a] rounded-full h-4 mb-4 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full rounded-full bg-gradient-to-r ${overallStatus.color}`}
            />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r ${overallStatus.color} bg-clip-text text-transparent border border-[#232a3a]`}>
              Status: {overallStatus.label}
            </span>
          </div>
        </motion.div>

        {/* Subject-wise Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#6366f1] to-[#38bdf8] bg-clip-text text-transparent">
            Subject-wise Breakdown
          </h2>

          {subjectStats.length === 0 ? (
            <div className="text-center py-12 bg-[#232a3a]/50 rounded-2xl border border-[#232a3a]">
              <p className="text-gray-400 text-lg">No subjects added yet.</p>
              <p className="text-gray-500 text-sm mt-2">Add subjects in the Subjects tab to see attendance breakdown.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjectStats.map((subject, index) => {
                const status = subject.status;
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className={`${status.bgColor} border ${status.borderColor} rounded-2xl p-5 backdrop-blur-sm`}
                  >
                    {/* Subject Name */}
                    <h3 className="text-lg font-bold mb-3 truncate">{subject.name}</h3>

                    {/* Attendance Percentage */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-3xl font-extrabold">
                        <span className={status.color}>{subject.percentage}%</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${status.bgColor} ${status.color} border ${status.borderColor}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Mini Progress Bar */}
                    <div className="w-full bg-[#0f172a]/50 rounded-full h-2 mb-3">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${
                          subject.percentage >= 85 ? 'from-green-400 to-emerald-400' :
                          subject.percentage >= 75 ? 'from-blue-400 to-cyan-400' :
                          subject.percentage >= 65 ? 'from-yellow-400 to-orange-400' :
                          'from-red-400 to-pink-400'
                        }`}
                        style={{ width: `${subject.percentage}%` }}
                      />
                    </div>

                    {/* Details */}
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Attended:</span>
                        <span className="text-white font-semibold">{subject.attendedClasses}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total:</span>
                        <span className="text-white font-semibold">{subject.totalClasses}</span>
                      </div>
                      {subject.requiredAttendance && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Required:</span>
                          <span className="text-white font-semibold">{subject.requiredAttendance}%</span>
                        </div>
                      )}
                      {subject.timing && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Timing:</span>
                          <span className="text-white font-semibold text-xs">{subject.timing.start} - {subject.timing.end}</span>
                        </div>
                      )}
                    </div>

                    {/* Days */}
                    {subject.days && subject.days.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {subject.days.map(day => (
                          <span key={day} className="text-[10px] px-2 py-1 rounded-full bg-[#0f172a]/50 text-gray-300 border border-gray-700">
                            {day}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Summary Statistics */}
        {subjectStats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
          >
            <div className="bg-gradient-to-br from-[#232a3a] to-[#1a1f2e] rounded-2xl p-6 border border-[#232a3a]">
              <h3 className="text-gray-400 text-sm mb-2">Total Subjects</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-[#6366f1] to-[#38bdf8] bg-clip-text text-transparent">
                {subjects.length}
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#232a3a] to-[#1a1f2e] rounded-2xl p-6 border border-[#232a3a]">
              <h3 className="text-gray-400 text-sm mb-2">Classes Attended</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-[#22c55e] to-[#38bdf8] bg-clip-text text-transparent">
                {totalAttended}
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#232a3a] to-[#1a1f2e] rounded-2xl p-6 border border-[#232a3a]">
              <h3 className="text-gray-400 text-sm mb-2">Classes Missed</h3>
              <p className="text-3xl font-bold bg-gradient-to-r from-[#ef4444] to-[#f97316] bg-clip-text text-transparent">
                {totalClasses - totalAttended}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
