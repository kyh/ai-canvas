import React from "react";
import { Tooltip } from "radix-ui";
import { Kbd, KbdGroup } from "./kbd";

function parseHotkey(hotkey: string): React.ReactNode {
  // Map of special characters to their display names
  const specialKeys: Record<string, string> = {
    "⌘": "⌘",
    "⌥": "⌥",
    "⌃": "⌃",
    "⇧": "⇧",
    Space: "Space",
  };

  // Check if it's a simple single key
  if (hotkey.length === 1 && !specialKeys[hotkey]) {
    return <Kbd>{hotkey.toUpperCase()}</Kbd>;
  }

  // Parse complex hotkeys like "⌘Z" or "⌘⇧Z"
  const parts: React.ReactNode[] = [];
  let i = 0;

  while (i < hotkey.length) {
    const char = hotkey[i];
    
    if (char === "⌘" || char === "⌥" || char === "⌃" || char === "⇧") {
      parts.push(<Kbd key={i}>{char}</Kbd>);
      i++;
    } else if (hotkey.slice(i).startsWith("Space")) {
      parts.push(<Kbd key={i}>Space</Kbd>);
      i += 5;
    } else {
      // Regular key
      const key = char.toUpperCase();
      parts.push(<Kbd key={i}>{key}</Kbd>);
      i++;
    }
  }

  return <KbdGroup>{parts}</KbdGroup>;
}

function CustomTooltip({
  content,
  hotkey,
  children,
}: {
  content: string;
  hotkey?: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="TooltipContent rounded-md z-50 px-2 py-1.5 text-sm shadow-sm text-background bg-foreground animate-in fade-in-0 zoom-in-95"
          sideOffset={5}
        >
          <div className="flex items-center gap-2">
            <span>{content}</span>
            {hotkey && parseHotkey(hotkey)}
          </div>
          <Tooltip.Arrow className="TooltipArrow !text-foreground fill-foreground" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export default CustomTooltip;
