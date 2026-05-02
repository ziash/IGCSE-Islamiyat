import { useState, useEffect, useRef } from 'react';
import { 
  Timer, 
  Bell, 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  LayoutGrid, 
  Trophy, 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Settings,
  CheckCircle2,
  PlayCircle,
  ChevronRight,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const API_BASE = "http://127.0.0.1:8000";

export default function App() {
  const [view, setView] = useState<'dashboard' | 'exam' | 'memorize'>('dashboard');
  const [studentName, setStudentName] = useState("Baba");
  
  // Exam State
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQIdx, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Memorize State
  const [memData, setMemData] = useState<any[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [memQueue, setMemQueue] = useState<any[]>([]);
  const [currentMemIdx, setCurrentMemIdx] = useState(0);
  const [typedLines, setTypedLines] = useState<string[]>([]);
  const [activeLineIdx, setActiveLineIdx] = useState(0);
  const [isMemStarted, setIsMemStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch Syllabus and Memorize Data on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/memorize`);
        if (!res.ok) throw new Error("Could not fetch memorize data");
        const data = await res.json();
        if (data.cards) {
          setMemData(data.cards);
        } else {
          console.warn("API returned no cards:", data);
        }
      } catch (err) {
        console.error("API Connection Error:", err);
      }
    };
    fetchData();
  }, []);

  // --- Exam Logic ---
  const startExam = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/exam/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_name: studentName, n_questions: 10 })
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Failed to generate exam");
      }

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions found in the question bank.");
      }

      setQuestions(data.questions);
      setCurrentQuestion(0);
      setAnswers({});
      setView('exam');
    } catch (err: any) {
      alert(`⚠️ Error: ${err.message}`);
    }
  };

  const submitExam = async () => {
    await fetch(`${API_BASE}/api/exam/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ student_name: studentName, questions, answers, time_taken: 300 })
    });
    alert("Exam Submitted!");
    setView('dashboard');
  };

  // --- Memorize Logic ---
  const toggleGroup = (groupId: string) => {
    setSelectedGroups(prev => prev.includes(groupId) ? prev.filter(g => g !== groupId) : [...prev, groupId]);
  };

  const startMemorize = () => {
    const queue = memData.filter(c => selectedGroups.includes(c.group_id));
    if (queue.length === 0) return alert("Select at least one topic!");
    setMemQueue(queue);
    setCurrentMemIdx(0);
    resetCard(queue[0]);
    setIsMemStarted(true);
  };

  const resetCard = (card: any) => {
    setTypedLines(new Array(card.lines.length).fill(""));
    setActiveLineIdx(0);
  };

  const handleType = (val: string) => {
    const currentLineText = memQueue[currentMemIdx].lines[activeLineIdx];
    const newTyped = [...typedLines];
    newTyped[activeLineIdx] = val;
    setTypedLines(newTyped);

    if (val.length >= currentLineText.length) {
      if (activeLineIdx < memQueue[currentMemIdx].lines.length - 1) {
        setActiveLineIdx(activeLineIdx + 1);
        if (inputRef.current) inputRef.current.value = "";
      }
    }
  };

  const nextCard = () => {
    if (currentMemIdx < memQueue.length - 1) {
      const nextIdx = currentMemIdx + 1;
      setCurrentMemIdx(nextIdx);
      resetCard(memQueue[nextIdx]);
      if (inputRef.current) inputRef.current.value = "";
    } else {
      finishMemorize();
    }
  };

  const finishMemorize = async () => {
    await fetch(`${API_BASE}/api/students/${studentName}/memorize-attempt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groups_selected: selectedGroups,
        cards_completed: memQueue.length,
        cards_total: memQueue.length
      })
    });
    alert("Great job! Memorization session completed.");
    setIsMemStarted(false);
    setView('dashboard');
  };

  const currentMemCard = memQueue[currentMemIdx];
  const allLinesDone = currentMemCard && activeLineIdx === currentMemCard.lines.length - 1 && typedLines[activeLineIdx].length >= currentMemCard.lines[activeLineIdx].length;

  return (
    <div className="min-h-screen pb-24 flex flex-col bg-slate-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b-2 border-slate-200 z-50 px-4 md:px-8 flex items-center justify-between">
        <h1 className="text-xl font-black text-emerald-600 tracking-tight italic">NUR ACADEMY</h1>
        <div className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center">
             <span className="font-bold text-emerald-700">{studentName[0]}</span>
        </div>
      </header>

      <main className="mt-24 flex-1 w-full max-w-7xl mx-auto px-4 md:px-8">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-8">
              <h2 className="text-3xl font-bold text-slate-800">Assalam-o-Alaikum, {studentName}!</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DashboardCard icon={<GraduationCap size={32} />} color="emerald" title="Practice Exam" desc="Test your knowledge with 10 random questions." action={startExam} />
                <DashboardCard icon={<BookOpen size={32} />} color="amber" title="Memorize Topics" desc="Interactive character-by-character typing practice." action={() => setView('memorize')} />
              </div>
            </motion.div>
          )}

          {view === 'exam' && questions.length > 0 && (
            <motion.div key="exam" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-sm">
                  <h2 className="text-2xl font-bold text-center mb-10">{questions[currentQIdx].question}</h2>
                  <div className="grid gap-4">
                    {Object.entries(questions[currentQIdx].options || {}).map(([key, text]: [any, any]) => (
                      <button key={key} onClick={() => setAnswers({...answers, [currentQIdx]: key})} className={`w-full text-left p-4 rounded-xl border-2 flex items-center justify-between transition-all ${answers[currentQIdx] === key ? 'border-emerald-600 bg-emerald-50' : 'border-slate-200 bg-white border-b-4 border-slate-300'}`}>
                        <span className="font-medium">{key}. {text}</span>
                        {answers[currentQIdx] === key && <CheckCircle2 className="text-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between">
                  <button disabled={currentQIdx === 0} onClick={() => setCurrentQuestion(currentQIdx - 1)} className="px-8 py-3 rounded-xl border-2 border-slate-200 bg-white font-bold disabled:opacity-50">Previous</button>
                  {currentQIdx === questions.length - 1 ? <button onClick={submitExam} className="px-12 py-3 rounded-xl bg-emerald-600 text-white font-bold border-b-4 border-emerald-800">Submit</button> : <button onClick={() => setCurrentQuestion(currentQIdx + 1)} className="px-12 py-3 rounded-xl bg-emerald-600 text-white font-bold border-b-4 border-emerald-800">Next</button>}
                </div>
              </div>
              <aside className="lg:col-span-4 bg-white border-2 border-slate-200 rounded-3xl p-6 h-fit sticky top-24">
                <div className="grid grid-cols-5 gap-2">{questions.map((_, i) => <button key={i} onClick={() => setCurrentQuestion(i)} className={`aspect-square rounded-lg flex items-center justify-center font-bold text-sm ${answers[i] ? 'bg-emerald-600 text-white' : i === currentQIdx ? 'border-2 border-emerald-600' : 'bg-slate-50 text-slate-300'}`}>{i + 1}</button>)}</div>
              </aside>
            </motion.div>
          )}

          {view === 'memorize' && (
             <motion.div key="mem" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
               {!isMemStarted ? (
                 <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-sm max-w-2xl mx-auto">
                   <h2 className="text-2xl font-bold mb-6">Select Topics to Memorize</h2>
                   <div className="grid gap-3 mb-8">
                     {Array.from(new Set(memData.map(c => c.group_id))).map(groupId => (
                       <label key={groupId} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                         <input type="checkbox" checked={selectedGroups.includes(groupId)} onChange={() => toggleGroup(groupId)} className="w-5 h-5 accent-emerald-600" />
                         <span className="font-medium">{memData.find(c => c.group_id === groupId)?.group_label}</span>
                       </label>
                     ))}
                   </div>
                   <button onClick={startMemorize} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl border-b-4 border-emerald-800">Start Session</button>
                 </div>
               ) : (
                 <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
                    <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-sm">
                      <h3 className="text-emerald-700 font-bold mb-4 text-center">{currentMemCard.title}</h3>
                      {currentMemCard.arabic && (
                        <div className="text-3xl font-serif text-right mb-8 bg-emerald-50 p-6 rounded-2xl border-r-4 border-emerald-600 leading-loose" dir="rtl">
                          {currentMemCard.arabic}
                        </div>
                      )}
                      <div className="flex flex-col gap-3 mb-8">
                        {currentMemCard.lines.map((line: string, i: number) => {
                          const typed = typedLines[i] || "";
                          const isActive = i === activeLineIdx && !allLinesDone;
                          return (
                            <div key={i} className={`p-3 rounded-xl transition-all ${isActive ? 'bg-emerald-50 border-l-4 border-emerald-600 shadow-inner' : ''}`}>
                              <div className="text-lg flex flex-wrap gap-[0px]">
                                {line.split("").map((char, charIdx) => {
                                  let color = "text-slate-400"; // Darkened from slate-300
                                  if (charIdx < typed.length) {
                                    color = typed[charIdx] === char ? "text-emerald-700 font-bold" : "text-red-500 bg-red-100 rounded-[2px]";
                                  } else if (isActive && charIdx === typed.length) {
                                    color = "text-emerald-800 border-l-2 border-emerald-600 animate-pulse font-black";
                                  }
                                  return <span key={charIdx} className={color}>{char === " " ? "\u00A0" : char}</span>;
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {!allLinesDone ? (
                        <input 
                          autoFocus
                          value={typedLines[activeLineIdx] || ""}
                          className="w-full p-4 text-lg border-2 border-emerald-600 rounded-xl outline-none focus:ring-4 ring-emerald-100 bg-white"
                          placeholder="Type the highlighted line exactly as shown..."
                          onChange={(e) => handleType(e.target.value)}
                        />
                      ) : (
                        <button onClick={nextCard} className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl border-b-4 border-emerald-800 flex items-center justify-center gap-2">
                          {currentMemIdx < memQueue.length - 1 ? "Next Card" : "Finish Session"}
                          <ChevronRight size={20} />
                        </button>
                      )}
                    </div>
                  </div>
               )}
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t-2 border-slate-200 flex justify-around items-center z-50">
        <NavButton icon={<LayoutDashboard size={24} />} label="Dash" active={view === 'dashboard'} onClick={() => {setView('dashboard'); setIsMemStarted(false);}} />
        <NavButton icon={<BookOpen size={24} />} label="Memorize" active={view === 'memorize'} onClick={() => setView('memorize')} />
        <NavButton icon={<GraduationCap size={24} />} label="Exams" active={view === 'exam'} onClick={() => {setView('exam'); setIsMemStarted(false);}} />
      </nav>
    </div>
  );
}

function DashboardCard({ icon, color, title, desc, action }: any) {
  const colors: any = { emerald: 'bg-emerald-100 text-emerald-600 hover:border-emerald-500', amber: 'bg-amber-100 text-amber-600 hover:border-amber-500' };
  return (
    <div className={`bg-white p-8 rounded-3xl border-2 border-slate-200 shadow-sm transition-all group ${colors[color]}`}>
      <div className={`${color === 'emerald' ? 'bg-emerald-100' : 'bg-amber-100'} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>{icon}</div>
      <h3 className="text-2xl font-bold mb-2 text-slate-800">{title}</h3>
      <p className="text-slate-500 mb-8">{desc}</p>
      <button onClick={action} className={`w-full py-4 text-white font-bold rounded-xl border-b-4 flex items-center justify-center gap-2 ${color === 'emerald' ? 'bg-emerald-600 border-emerald-800' : 'bg-amber-500 border-amber-700'}`}>
        <PlayCircle size={20} /> Start
      </button>
    </div>
  );
}

function NavButton({ icon, label, active = false, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 transition-all ${active ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
      {icon} <span className="text-[10px] font-black uppercase">{label}</span>
    </button>
  );
}
