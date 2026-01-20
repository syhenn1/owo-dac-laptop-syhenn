import { useRef, useState, useMemo, useEffect } from "react";
import { useDraggable } from "./hooks/useDraggable";

interface StickyInfoBoxProps {
  schoolData: Record<string, string>;
  itemData: Record<string, string>;
  history: any[];
}

export default function StickyInfoBox({
  schoolData,
  itemData,
  history,
}: StickyInfoBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null!);
  const { position, handleMouseDown } = useDraggable<HTMLDivElement>(
    boxRef,
    "sticky-info-box"
  );

  return (
    <div
      ref={boxRef}
      style={{
        position: "fixed",
        left: position.x,
        top: position.y,
        touchAction: "none",
        zIndex: 1000,
        width: "320px",
        borderRadius: "8px",
        fontFamily: "sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.5)", // Darker shadow
        backgroundColor: "#18181b", // zinc-900
        border: "2px solid #3f3f46", // zinc-700
      }}
      className="text-zinc-100 flex flex-col max-h-[80vh]"
    >
      {/* Header */}
      <div
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown} // Support touch start
        onClick={(e) => e.stopPropagation()}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px 18px",
          cursor: "move",
          borderBottom: "1px solid #3f3f46", // zinc-700
          backgroundColor: "#27272a", // zinc-800
          borderTopLeftRadius: "6px",
          borderTopRightRadius: "6px",
          flexShrink: 0,
        }}
      >
        <span className="font-bold text-yellow-500 text-sm">
          {schoolData.nama_sekolah || "-"}
        </span>
      </div>

      {/* Content */}
      <div
        className="p-3 text-sm space-y-3 bg-zinc-900 text-white overflow-y-auto custom-scrollbar"
        onClick={(e) => e.stopPropagation()}
      >
        {/* School Info */}
        <div className="">
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              NPSN
            </div>
            <div className="text-lg font-mono text-yellow-500">
              {schoolData.npsn || "-"}
            </div>
          </div>
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Serial Number
          </div>
          <div className="text-lg font-mono text-yellow-500">
            {itemData.serial_number || "-"}
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Kecamatan
            </div>
            <div className="text-xs text-white truncate">
              {schoolData.kecamatan || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Alamat
            </div>
            <div className="text-xs text-white truncate">
              {schoolData.alamat || "-"}
            </div>
          </div>
        </div>

        <hr className="border-zinc-700" />

        {/* Item Info */}
        <div className="">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
            Barang
          </div>
          <div
            className="text-xs text-white truncate"
            title={itemData.nama_barang}
          >
            {itemData.nama_barang || "-"}
          </div>
        </div>

        <hr className="border-zinc-700" />

        {/* History Info */}
        <div className="">
          <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            Riwayat Approval
          </div>
          {history && history.length > 0 ? (
            <div className="space-y-3">
              {history.map((log: any, idx: number) => (
                <div
                  key={idx}
                  className={`border border-zinc-700 rounded p-2 ${log.status.toLowerCase().includes("setuju") ||
                    log.status.toLowerCase().includes("terima")
                    ? "bg-green-900/20 border-green-900/50"
                    : "bg-red-900/20 border-red-900/50"
                    }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {log.date}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${log.status.toLowerCase().includes("setuju") ||
                        log.status.toLowerCase().includes("terima")
                        ? "bg-green-900/50 text-green-400"
                        : "bg-red-900/50 text-red-400"
                        }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  {log.user && (
                    <div className="text-xs font-semibold text-zinc-300 mb-0.5">
                      {log.user}
                    </div>
                  )}
                  <div className="text-xs text-zinc-400 italic">
                    {log.note}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-xs text-zinc-600 italic">
              Belum ada riwayat.
            </div>
          )}
        </div>

      </div>
    </div >
  );
}
