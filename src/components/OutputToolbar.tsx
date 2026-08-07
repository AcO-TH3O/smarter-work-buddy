import { Copy, Eraser, Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function OutputToolbar({
  editing,
  onToggleEdit,
  copyText,
  onClear,
  onRegenerate,
  regenerating,
}: {
  editing: boolean;
  onToggleEdit: () => void;
  copyText: string;
  onClear: () => void;
  onRegenerate: () => void;
  regenerating?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onToggleEdit}>
        <Pencil className="h-4 w-4" />
        {editing ? "Done" : "Edit"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          navigator.clipboard.writeText(copyText);
          toast.success("Copied to clipboard");
        }}
      >
        <Copy className="h-4 w-4" />
        Copy
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={onClear}>
        <Eraser className="h-4 w-4" />
        Clear
      </Button>
      <Button type="button" size="sm" onClick={onRegenerate} disabled={regenerating}>
        <RefreshCw className={`h-4 w-4 ${regenerating ? "animate-spin" : ""}`} />
        Regenerate
      </Button>
    </div>
  );
}
