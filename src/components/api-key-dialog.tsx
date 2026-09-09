"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";

export const GATEWAY_API_KEY_STORAGE_KEY = "gateway-api-key";

interface ApiKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Own component so the input seeds from localStorage on mount: the dialog
// portal unmounts on close, so opening it always starts a fresh form.
const ApiKeyForm = ({ onOpenChange }: Pick<ApiKeyDialogProps, "onOpenChange">) => {
  const [apiKey, setApiKey, removeApiKey] = useLocalStorage(GATEWAY_API_KEY_STORAGE_KEY, "");
  const [apiKeyInput, setApiKeyInput] = React.useState(apiKey);

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(apiKeyInput.trim());
      toast.success("API key saved");
    } else {
      removeApiKey();
    }
    onOpenChange(false);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Enter Vercel Gateway API Key</DialogTitle>
        <DialogDescription>
          Enter your{" "}
          <a
            href="https://vercel.com/d?to=%2F%5Bteam%5D%2F%7E%2Fai%2Fapi-keys%3Futm_source%3Dcanvas.kyh.io&title=Get+an+API+Key"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Vercel Gateway API key
          </a>{" "}
          to use AI features. Your key will be stored locally in your browser.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4 flex flex-col gap-2">
        <Input
          type="password"
          placeholder="vck_..."
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && apiKeyInput.trim()) {
              handleSaveApiKey();
            }
          }}
          autoFocus
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSaveApiKey}>Save</Button>
      </DialogFooter>
    </>
  );
};

export const ApiKeyDialog = ({ open, onOpenChange }: ApiKeyDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <ApiKeyForm onOpenChange={onOpenChange} />
    </DialogContent>
  </Dialog>
);
