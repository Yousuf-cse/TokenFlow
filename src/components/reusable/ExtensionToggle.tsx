import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";

export default function ExtensionToggle() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    chrome.storage.local.get("isEnabled", (res) => {
      if (res.isEnabled === undefined) {
        chrome.storage.local.set({ isEnabled: true });
        setEnabled(true);
      } else {
        setEnabled(res.isEnabled);
      }
    });
  }, []);

  const handleToggle = (value: boolean) => {
    setEnabled(value);
    chrome.storage.local.set({ isEnabled: value });
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <span className="text-sm font-medium">
        Extension is {enabled ? "Enabled" : "Disabled"}
      </span>
      <Switch checked={enabled} onCheckedChange={handleToggle} />
    </div>
  );
}
