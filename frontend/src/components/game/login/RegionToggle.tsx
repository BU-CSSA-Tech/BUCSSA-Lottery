"use client";

type Region = "us" | "cn";

interface RegionToggleProps {
  region: Region;
  onChange: (region: Region) => void;
}

export default function RegionToggle({ region, onChange }: RegionToggleProps) {
  return (
    <div className="flex rounded-lg border border-white/40 bg-white/10 p-1 mb-8">
      <button
        type="button"
        onClick={() => onChange("us")}
        className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
          region === "us"
            ? "bg-white/25 text-white border border-white/50 shadow-sm"
            : "text-white/60 hover:text-white/80"
        }`}
      >
        美区
      </button>
      <button
        type="button"
        onClick={() => onChange("cn")}
        className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
          region === "cn"
            ? "bg-white/25 text-white border border-white/50 shadow-sm"
            : "text-white/60 hover:text-white/80"
        }`}
      >
        国区
      </button>
    </div>
  );
}

export type { Region };
