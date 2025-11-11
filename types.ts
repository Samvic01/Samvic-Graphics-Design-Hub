
import React from 'react';

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4";
export type VideoAspectRatio = "16:9" | "9:16";

export interface Feature {
  id: string;
  name: string;
  icon: React.FC<{ className?: string }>;
  component: React.FC;
}
