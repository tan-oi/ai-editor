"use client";
import { EditorMachine } from "@/app/machines/editor-state";
import { createActorContext } from "@xstate/react";

export const EditorMachineContext = createActorContext(EditorMachine);

export function EditorContext({ children }: { children: React.ReactNode }) {
  return (
    <EditorMachineContext.Provider>{children}</EditorMachineContext.Provider>
  );
}
