"use client";
import { useEffect, useRef } from "react";
import { EditorState } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { schema } from "prosemirror-schema-basic";
import { EditorMachineContext } from "@/lib/context/editor-machine-context";

export function Editor() {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const actorRef = EditorMachineContext.useActorRef();

  useEffect(() => {
    if (!editorRef.current || viewRef.current) return;

    const view = new EditorView(editorRef.current, {
      state: EditorState.create({
        schema,
      }),
      attributes: {
        class:
          "ProseMirror outline-none min-h-[75vh] leading-[1.8] text-xl text-stone-600 focus:text-stone-900 transition-colors duration-300 tracking-tight text-md",
      },
    });

    viewRef.current = view;
    actorRef.send({ type: "setEditor", editor: view });

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [actorRef]);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto px-2 pb-10 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-stone-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:hover:bg-stone-300"
    >
      <div className="w-full md:w-[85%] lg:w-[95%] mx-auto font-family-editor pt-4 pb-10">
        <div ref={editorRef} />
      </div>
    </div>
  );
}
