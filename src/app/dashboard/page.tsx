"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SubjectCard from "@/components/SubjectCard";

// Updated type: made attendedClasses and totalClasses strict numbers (no optional '?')
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
      // 1. Tell TypeScript this is an array of unknown objects from JSON
      const parsedSubjects = JSON.parse(subjectData) as Record<string, unknown>[];
      
      // 2. Map over them safely without using 'any'
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

  const handleMarkAttendance = (index: number, type: "present" | "absent" | "no-class") => {
    const updatedSubjects = [...subjects];
    const subject = updatedSubjects[index];

    if (type === "present") {
      subject.attendedClasses += 1;
      subject.totalClasses += 1;
    } else if (type === "absent") {
      subject.totalClasses += 1;
    }

    setSubjects(updatedSubjects);
    localStorage.setItem("subjects", JSON.stringify(updatedSubjects));

    const updatedMarked = [...markedSubjects, index];
    setMarkedSubjects(updatedMarked);
    localStorage.setItem(`marked-${todayStr}`, JSON.stringify(updatedMarked));
  };

  const todaySubjects = subjects.filter((subject) => subject.days.includes(todayStr));

  if (!user) return null;

  return (
    <div className="px-4 py-8 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 bg-gradient-to-r from-[#6366f1] via-[#38bdf8] to-[#22c55e] bg-clip-text text-transparent drop-shadow-lg">
        Hello, {user.name}!
      </h1>
      <p className="text-lg sm:text-xl text-body mb-6">Today&apos;s Attendance - {todayStr}</p>

      {todaySubjects.length === 0 ? (
        <p className="text-white text-lg">No classes today, take a break! 🎉</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
          {todaySubjects.map((subject, index) => (
            <SubjectCard
              key={index}
              subject={subject}
              index={index}
              onMark={handleMarkAttendance}
              marked={markedSubjects.includes(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
