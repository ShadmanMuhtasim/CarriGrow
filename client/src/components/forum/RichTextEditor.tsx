import { useEffect, useRef } from "react";
import Button from "../ui/Button";

type RichTextEditorProps = {
  label?: string;
  value: string;
  onChange: (nextValue: string) => void;
  placeholder?: string;
  minHeight?: number;
};

type EditorCommand = "bold" | "italic" | "insertUnorderedList";

export default function RichTextEditor({
  label = "Content",
  value,
  onChange,
  placeholder = "Write your post here...",
  minHeight = 180,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    if (editor.innerHTML !== value) {
      editor.innerHTML = value || "";
    }
  }, [value]);

  function applyCommand(command: EditorCommand) {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.focus();
    document.execCommand(command);
    onChange(editor.innerHTML);
  }

  return (
    <div>
      <label className="form-label">{label}</label>
      <div className="border rounded-3 overflow-hidden">
        <div className="border-bottom bg-light p-2 d-flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="btn-sm" onClick={() => applyCommand("bold")}>
            <i className="bi bi-type-bold" />
          </Button>
          <Button type="button" variant="outline" className="btn-sm" onClick={() => applyCommand("italic")}>
            <i className="bi bi-type-italic" />
          </Button>
          <Button type="button" variant="outline" className="btn-sm" onClick={() => applyCommand("insertUnorderedList")}>
            <i className="bi bi-list-ul" />
          </Button>
        </div>

        <div
          ref={editorRef}
          contentEditable
          className="p-3 forum-rich-editor"
          style={{ minHeight }}
          onInput={(event) => onChange(event.currentTarget.innerHTML)}
          data-placeholder={placeholder}
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}
