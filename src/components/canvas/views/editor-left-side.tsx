import * as React from "react";
import {
  MoreHorizontal,
  EyeOff,
  Eye,
  SettingsIcon,
  Trash2,
  Copy,
  ArrowUp,
  ArrowUpToLine,
  ArrowDown,
  ArrowDownToLine,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/mode-toggle";
import { ApiKeyDialog } from "@/components/api-key-dialog";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IEditorBlocks } from "@/lib/schema";
import { BlockIcon } from "../utils";
import { useEditorStore } from "../use-editor";
import { useShallow } from "zustand/react/shallow";
import { useOrderedBlocks } from "../hooks/use-ordered-blocks";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function GitHubLogoIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.69-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.35.96.1-.74.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.4-5.26 5.69.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56 4.56-1.52 7.85-5.83 7.85-10.91C23.5 5.73 18.27.5 12 .5z" />
    </svg>
  );
}

interface BlockItemProps extends React.HTMLAttributes<HTMLDivElement> {
  block: IEditorBlocks;
  selected?: boolean;
  onSelectBlock?: (block: IEditorBlocks) => void;
  onHoverChange?: (hovered: boolean) => void;
  onRename?: (id: string, label: string) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleVisibility?: (id: string) => void;
  onBringForward?: (id: string) => void;
  onBringBackward?: (id: string) => void;
  onBringToFront?: (id: string) => void;
  onBringToBack?: (id: string) => void;
}

const BlockItem = React.forwardRef<HTMLDivElement, BlockItemProps>(
  (
    {
      block,
      selected = false,
      onSelectBlock,
      onHoverChange,
      onRename,
      onDuplicate,
      onDelete,
      onToggleVisibility,
      onBringForward,
      onBringBackward,
      onBringToFront,
      onBringToBack,
      className,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref
  ) => {
    const [label, setLabel] = React.useState(block.label);
    const [editable, setEditable] = React.useState(false);

    React.useEffect(() => {
      if (!editable) {
        setLabel(block.label);
      }
    }, [block.label, editable]);

    const handleSelect = React.useCallback(() => {
      if (!block.visible) {
        return;
      }
      onSelectBlock?.(block);
    }, [block, onSelectBlock]);

    return (
      <div
        ref={ref}
        className={cn(
          "sidebar-item group/item relative mx-2 my-0.5",
          {
            "opacity-40": !block.visible,
          },
          className
        )}
        data-block-id={block.id}
        onMouseEnter={(event) => {
          if (block.visible) {
            onHoverChange?.(true);
          }
          onMouseEnter?.(event);
        }}
        onMouseLeave={(event) => {
          onHoverChange?.(false);
          onMouseLeave?.(event);
        }}
        {...props}
      >
        <button
          type="button"
          className={cn(
            "group/button flex items-center gap-3 w-full p-[3px] border rounded-xl transition-colors group-hover/item:bg-muted",
            {
              "bg-muted border-border/60": selected,
              "border-transparent": !selected,
            }
          )}
          onClick={handleSelect}
          aria-label={`Select ${block.label}`}
        >
          <div
            className={cn(
              "flex justify-center items-center shrink-0 size-8 rounded-lg transition-all group-hover/item:bg-background",
              {
                "bg-background shadow-sm": selected,
                "bg-muted": !selected,
              }
            )}
          >
            <div className="text-base opacity-70">{BlockIcon(block.type)}</div>
          </div>
          {editable ? (
            <Input
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="sidebar-item-label-input flex-1 h-6 overflow-hidden text-ellipsis px-1 text-sm truncate border-border bg-muted"
              autoFocus
              onFocus={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
              onBlur={() => {
                setEditable(false);
                if (block.label !== label) {
                  onRename?.(block.id, label);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setEditable(false);
                  if (block.label !== label) {
                    onRename?.(block.id, label);
                  }
                }
                if (event.key === "Escape") {
                  setEditable(false);
                  setLabel(block.label);
                }
              }}
            />
          ) : (
            <div className="flex-1 h-6 px-1 text-sm truncate flex items-center">
              {block.label}
            </div>
          )}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="sidebar-item-actions absolute top-1/2 right-3 -translate-y-1/2 z-3 invisible rounded-lg p-1.5 text-foreground/50 transition-all hover:bg-muted hover:text-foreground"
                onClick={(event) => {
                  event.stopPropagation();
                  handleSelect();
                }}
              >
                <MoreHorizontal className="size-4" />
              </button>
            }
          />
          <DropdownMenuContent className="w-52">
            <DropdownMenuItem onClick={() => setEditable(true)}>
              <Pencil className="mr-1 size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDuplicate?.(block.id)}>
              <Copy className="mr-1 size-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete?.(block.id)}>
              <Trash2 className="mr-1 size-4" />
              Delete
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onToggleVisibility?.(block.id)}>
              {block.visible ? (
                <EyeOff className="mr-1 size-4" />
              ) : (
                <Eye className="mr-1 size-4" />
              )}
              {block.visible ? "Hide" : "Show"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onBringForward?.(block.id)}>
              <ArrowUp className="mr-1 size-4" />
              Bring forward
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBringToFront?.(block.id)}>
              <ArrowUpToLine className="mr-1 size-4" />
              Bring to front
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBringBackward?.(block.id)}>
              <ArrowDown className="mr-1 size-4" />
              Bring backward
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBringToBack?.(block.id)}>
              <ArrowDownToLine className="mr-1 size-4" />
              Bring to back
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }
);

BlockItem.displayName = "BlockItem";

function EditorLeftSide() {
  const [showApiKeyDialog, setShowApiKeyDialog] = React.useState(false);
  const blocks = useOrderedBlocks();
  const [selectedIds, setSelectedIds] = useEditorStore(
    useShallow((state) => [state.selectedIds, state.setSelectedIds])
  );
  const [
    setHoveredId,
    updateBlockValues,
    duplicateBlock,
    deleteBlock,
    showHideBlock,
    bringForwardBlock,
    bringBackwardBlock,
    bringToTopBlock,
    bringToBackBlock,
  ] = useEditorStore(
    useShallow((state) => [
      state.setHoveredId,
      state.updateBlockValues,
      state.duplicateBlock,
      state.deleteBlock,
      state.showHideBlock,
      state.bringForwardBlock,
      state.bringBackwardBlock,
      state.bringToTopBlock,
      state.bringToBackBlock,
    ])
  );

  const handleSelect = React.useCallback(
    (block: IEditorBlocks) => {
      if (!block.visible) {
        return;
      }
      setSelectedIds([block.id]);
    },
    [setSelectedIds]
  );

  return (
    <div className="editor-left-side fixed left-3 top-3 bottom-3 z-20 hidden md:flex w-64 flex-col border border-border/50 bg-background/95 backdrop-blur shadow-xl rounded-[1.25rem] overflow-hidden">
      <p className="p-4 pb-3 text-sm font-semibold">Layers</p>
      <ScrollArea className="flex-1">
        {blocks.map((block) => (
          <BlockItem
            key={block.id}
            block={block}
            selected={selectedIds.length === 1 && selectedIds[0] === block.id}
            onSelectBlock={handleSelect}
            onHoverChange={(hovered) => setHoveredId(hovered ? block.id : null)}
            onRename={(id, label) => updateBlockValues(id, { label })}
            onDuplicate={duplicateBlock}
            onDelete={deleteBlock}
            onToggleVisibility={showHideBlock}
            onBringForward={bringForwardBlock}
            onBringBackward={bringBackwardBlock}
            onBringToFront={bringToTopBlock}
            onBringToBack={bringToBackBlock}
          />
        ))}
      </ScrollArea>
      <div className="border-t border-border p-2 flex items-center justify-between gap-2">
        <div>
          <Button
            variant="outline"
            size="icon"
            nativeButton={false}
            render={
              <Link href="https://github.com/kyh/ai-canvas">
                <span className="sr-only">GitHub</span>
                <GitHubLogoIcon className="size-5" />
              </Link>
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button
            variant="outline"
            size="icon"
            className="size-10"
            onClick={() => setShowApiKeyDialog(true)}
          >
            <SettingsIcon className="size-5" />
          </Button>
        </div>
      </div>
      <ApiKeyDialog
        open={showApiKeyDialog}
        onOpenChange={setShowApiKeyDialog}
      />
    </div>
  );
}

export default EditorLeftSide;
