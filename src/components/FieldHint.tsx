import React from "react";
type FHProps = { text?: string; children?: React.ReactNode };
export default function FieldHint({ text, children }: FHProps) {
  return <p className="text-xs text-gray-500 mt-1">{text ?? children}</p>;
}
