"use client";

import { useState, useEffect } from "react";
import { StickyNote, Plus, Trash2 } from "lucide-react";

interface Note {
  id: string;
  title: string;
  body: string;
  color: string;
  updatedAt: string;
}

const STORAGE_KEY = "revops_notes";
const COLORS = ["bg-yellow-900/30", "bg-blue-900/30", "bg-purple-900/30", "bg-green-900/30", "bg-pink-900/30"];

const emptyNote = (color = COLORS[0]): Note => ({
  id: Date.now().toString(),
  title: "",
  body: "",
  color,
  updatedAt: new Date().toISOString(),
});

export default function QuickNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setNotes(parsed);
      if (parsed.length > 0) setActiveId(parsed[0].id);
    }
  }, []);

  const save = (updated: Note[]) => {
    setNotes(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const addNote = () => {
    const color = COLORS[notes.length % COLORS.length];
    const n = emptyNote(color);
    const updated = [n, ...notes];
    save(updated);
    setActiveId(n.id);
  };

  const updateNote = (id: string, field: keyof Note, value: string) => {
    save(
      notes.map((n) =>
        n.id === id ? { ...n, [field]: value, updatedAt: new Date().toISOString() } : n
      )
    );
  };

  const removeNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    save(updated);
    setActiveId(updated[0]?.id ?? null);
  };

  const active = notes.find((n) => n.id === activeId);

  return (
    <div className="card p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <StickyNote className="w-4 h-4 text-yellow-400" />
        <h2 className="text-sm font-semibold text-[#E6EDF3]">Quick Notes</h2>
        <button
          onClick={addNote}
          className="ml-auto flex items-center gap-1 px-2 py-1 bg-[#21262D] text-[#E6EDF3] text-xs rounded-lg hover:bg-[#30363D] transition-colors"
        >
          <Plus className="w-3 h-3" /> New
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <StickyNote className="w-8 h-8 text-[#21262D] mx-auto mb-2" />
            <p className="text-xs text-[#8B949E]">No notes yet.</p>
            <button onClick={addNote} className="text-xs text-[#8DC647] mt-1 hover:underline">Create your first note</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 flex-1 min-h-0">
          {/* Note list */}
          <div className="w-32 flex-shrink-0 space-y-1 overflow-y-auto">
            {notes.map((n) => (
              <button
                key={n.id}
                onClick={() => setActiveId(n.id)}
                className={`w-full text-left p-2 rounded-lg transition-colors text-xs truncate ${
                  n.id === activeId ? "bg-[#21262D] text-[#E6EDF3]" : "text-[#8B949E] hover:bg-[#21262D]/50"
                }`}
              >
                {n.title || "Untitled"}
              </button>
            ))}
          </div>

          {/* Active note editor */}
          {active && (
            <div className={`flex-1 rounded-xl p-3 flex flex-col gap-2 min-h-0 ${active.color}`}>
              <div className="flex items-center gap-2">
                <input
                  value={active.title}
                  onChange={(e) => updateNote(active.id, "title", e.target.value)}
                  placeholder="Note title..."
                  className="flex-1 bg-transparent text-sm font-semibold text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none"
                />
                <button
                  onClick={() => removeNote(active.id)}
                  className="p-1 text-[#8B949E] hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                value={active.body}
                onChange={(e) => updateNote(active.id, "body", e.target.value)}
                placeholder="Meeting notes, research, talking points..."
                className="flex-1 bg-transparent text-xs text-[#E6EDF3] placeholder-[#8B949E] focus:outline-none resize-none min-h-[120px]"
              />
              <div className="text-xs text-[#8B949E] text-right">
                {new Date(active.updatedAt).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
