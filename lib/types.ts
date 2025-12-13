import { EditorView } from "prosemirror-view";

export type TextStyle = "auto" | "professional" | "creative" | "casual";

export interface EditorContext {
  editorInstance: EditorView | null;
  textStyle: TextStyle;
  contextText: string | null;
  insertPosition: number | null;
  error: string | null;
  isSelection : boolean
}