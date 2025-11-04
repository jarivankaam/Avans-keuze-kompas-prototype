// components/VKMModal.tsx
"use client";

import { useEffect } from "react";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export default function VKMModal({ isOpen, onClose, children }: ModalProps) {
  // ESC key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center "
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full animate-fadeIn overflow-y-scroll max-h-[500px]
"
        onClick={(e) => e.stopPropagation()} // prevent close on form click
      >
        {children}
      </div>
    </div>
  );
}
