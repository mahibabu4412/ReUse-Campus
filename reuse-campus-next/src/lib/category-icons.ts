import {
  BookOpen, FileText, PenTool, Calculator, Cpu, FlaskConical, PencilLine, Layers,
  type LucideIcon,
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  book: BookOpen,
  "file-text": FileText,
  "pen-tool": PenTool,
  calculator: Calculator,
  cpu: Cpu,
  flask: FlaskConical,
  "edit-3": PencilLine,
  layers: Layers,
};

export function iconForCategory(name?: string | null): LucideIcon {
  return (name && map[name]) || Layers;
}
