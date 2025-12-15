"use client";
import { TextStyle } from "@/lib/types";
import { EditorMachineContext } from "@/lib/context/editor-machine-context";

export function StyleSelect() {
  const actorRef = EditorMachineContext.useActorRef();
  const textStyle = EditorMachineContext.useSelector(
    (state) => state.context.textStyle
  );
  const editorInstance = EditorMachineContext.useSelector(
    (state) => state.context.editorInstance
  );

  const handleStyleChange = (style: TextStyle) => {
    actorRef.send({ type: "setStyle", style });
  };

  return (
    <div className="relative group font-family-ui flex items-center gap-2">
      <p className="text-sm text-stone-500">Writing style : </p>
      <select
        className="appearance-none bg-transparent hover:bg-stone-100 text-stone-500 font-medium text-sm py-2 pl-3 pr-8 rounded-lg cursor-pointer transition-colors outline-none focus:ring-1 focus:ring-stone-200 backdrop-blur-3xl"
        onChange={(e) => handleStyleChange(e.target.value as TextStyle)}
        value={textStyle || "auto"}
        disabled={!editorInstance}
      >
        <option value="auto">Auto</option>
        <option value="professional">Professional</option>
        <option value="creative">Creative</option>
        <option value="casual">Casual</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-400">
        <svg
          className="fill-current h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
        >
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}
