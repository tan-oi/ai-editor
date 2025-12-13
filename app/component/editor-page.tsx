"use client";

import EditorToolbar from "./editor-toolbar";
import { Editor } from "./editor";

export default function EditorPage() {
  return (
    <div className="h-screen flex flex-col items-center bg-[#FDFCF8] text-stone-800 overflow-hidden selection:bg-stone-200 selection:text-stone-900">
      <header className="w-full h-16 flex items-center justify-center transition-opacity duration-500 z-10 animate-pulse">
        <span className="text-xs font-medium text-stone-400 tracking-widest uppercase font-family-ui">
          Draft / Untitled
        </span>
      </header>

      <main className="flex-1 w-full max-w-4xl px-6 flex flex-col relative overflow-hidden lg:border-x lg:border-stone-200/50 lg:shadow-[0_0_40px_-15px_rgba(0,0,0,0.03)] bg-[#FDFCF8]">
        <Editor />
        <EditorToolbar />
      </main>
    </div>
  );
}
