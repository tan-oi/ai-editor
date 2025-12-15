"use client";
import { EditorView } from "prosemirror-view";
import { Loader2 } from "lucide-react";
import { EditorMachineContext } from "@/lib/context/editor-machine-context";

interface ContinueButtonProps {
  editorInstance: EditorView | null;
}

export function ContinueBtn({ editorInstance }: ContinueButtonProps) {
  const actorRef = EditorMachineContext.useActorRef();
  const isFetching = EditorMachineContext.useSelector((state) =>
    state.matches("fetching")
  );

  const handleContinueWriting = () => {
    if (!editorInstance) return;

    const { from, to, empty } = editorInstance.state.selection;
    actorRef.send({
      type: "continueWriting",
      from, 
      to,
      empty,
    });
  };

  return (
    <button
      onClick={handleContinueWriting}
      disabled={isFetching || !editorInstance}
      className="font-family-ui bg-stone-800 hover:bg-stone-700 text-stone-50 text-sm font-medium py-2 px-5 rounded-lg shadow-sm hover:shadow transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {isFetching ? (
        <p className="flex gap-1">
          <Loader2 className="size-5 animate-spin" />
          <span>Writing</span>
        </p>
      ) : (
        "Continue Writing"
      )}
    </button>
  );
}
