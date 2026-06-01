"use client";

type Region = "us" | "cn";

interface RegionToggleProps {
  region: Region;
  onChange: (region: Region) => void;
}

export default function RegionToggle({ region, onChange }: RegionToggleProps) {
  return (
    <div className="flex rounded-lg theme-panel-glass p-1 mb-8">
      <button
        type="button"
        onClick={() => onChange("us")}
        className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
          region === "us"
            ? "theme-segment-active"
            : "theme-segment-inactive"
        }`}
      >
        美区
      </button>
      <button
        type="button"
        onClick={() => onChange("cn")}
        className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
          region === "cn"
            ? "theme-segment-active"
            : "theme-segment-inactive"
        }`}
      >
        国区
      </button>
    </div>
  );
}

export type { Region };
