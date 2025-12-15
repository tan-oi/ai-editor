import { Toaster } from "sonner";
import EditorPage from "./component/editor-page";

export default function Home() {
  return (
    <div>
      <EditorPage />
      <Toaster richColors />
    </div>
  );
}
