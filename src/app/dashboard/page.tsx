"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SubjectCard from "@/components/SubjectCard";

type Subject = {
  name: string;
  days: string[];
  timing?: { start: string; end: string };
  requiredAttendance?: number;
  attendedClasses: number; 
  totalClasses: number;    
};

type User = {
  name: string;
  email: string;
  picture: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [markedSubjects, setMarkedSubjects] = useState<number[]>([]);
  const router = useRouter();

  const today = new Date();
  const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayStr = dayMap[today.getDay()];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const subjectData = localStorage.getItem("subjects");

    if (!userData) {
      router.replace("/");
    } else {
      setUser(JSON.parse(userData));
    }

    if (subjectData) {
      const parsedSubjects = JSON.parse(subjectData) as Record<string, unknown>[];
      
      const safeSubjects: Subject[] = parsedSubjects.map((s) => ({
        name: typeof s.name === "string" ? s.name : "Unknown Subject",
        days: Array.isArray(s.days) ? (s.days as string[]) : [],
        timing: s.timing ? (s.timing as { start: string; end: string }) : undefined,
        requiredAttendance: typeof s.requiredAttendance === "number" ? s.requiredAttendance : undefined,
        attendedClasses: typeof s.attendedClasses === "number" ? s.attendedClasses : 0,
        totalClasses: typeof s.totalClasses === "number" ? s.totalClasses : 0,
      }));
      
      setSubjects(safeSubjects);
    }

    const marked = localStorage.getItem(`marked-${todayStr}`);
    if (marked) setMarkedSubjects(JSON.parse(marked));
  }, [router, todayStr]);

  // Handle attendance updates using the main state array index
  const handleMarkAttendance = (originalIndex: number, type: "present" | "absent" | "no-class") => {
    // Clone array deeply enough to avoid direct state mutation
    const updatedSubjects = subjects.map((sub, idx) => {
      if (idx !== originalIndex) return sub;

      const newAttended = type === "present" ? sub.attendedClasses + 1 : sub.attendedClasses;
      const newTotal = type === "present" || type === "absent" ? sub.totalClasses + 1 : sub.totalClasses;

      return {
        ...sub,
        attendedClasses: newAttended,
        totalClasses: newTotal,
      };
    });

    setSubjects(updatedSubjects);
    localStorage.setItem("subjects", JSON.stringify(updatedSubjects));

    // Store original index so the button stays disabled/marked today
    if (!markedSubjects.includes(originalIndex)) {
      const updatedMarked = [...markedSubjects, originalIndex];
      setMarkedSubjects(updatedMarked);
      localStorage.setItem(`marked-${todayStr}`, JSON.stringify(updatedMarked));
    }
  };

  if (!user) return null;

  return (
    <div className="px-4 py-8 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 bg-gradient-to-r from-[#6366f1] via-[#38bdf8] to-[#22c55e] bg-clip-text text-transparent drop-shadow-lg">
        Hello, {user.name}!
      </h1>
      <p className="text-lg sm:text-xl text-body mb-6">Today&apos;s Attendance - {todayStr}</p>

      {/* Map through original array, keeping track of the original index */}
      {subjects.filter((s) => s.days.includes(todayStr)).length === 0 ? (
        <p className="text-white text-lg">No classes today, take a break! 🎉</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {subjects.map((subject, originalIndex) => {
            // Only render subjects scheduled for today
            if (!subject.days.includes(todayStr)) return null;

            return (
              <SubjectCard
                key={subject.name + originalIndex}
                subject={subject}
                index={originalIndex} // <-- Pass the actual index in `subjects`
                onMark={handleMarkAttendance}
                marked={markedSubjects.includes(originalIndex)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
