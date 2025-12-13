"use client";

import { EditorMachineContext } from "@/lib/context/editor-machine-context";
import { StyleSelect } from "./style-select";
import { ContinueBtn } from "./continue-button";

export default function EditorToolbar() {
  const editorInstance = EditorMachineContext.useSelector(
    (state) => state.context.editorInstance
  );

  return (
    <div className="z-20 bg-linear-to-t from-stone-50 via-stone-50 to-transparent pt-4 pb-8 pointer-events-none">
      <div className="flex items-center justify-end gap-4 pointer-events-auto">
        <StyleSelect />
        <ContinueBtn editorInstance={editorInstance} />
      </div>
    </div>
  );
}
