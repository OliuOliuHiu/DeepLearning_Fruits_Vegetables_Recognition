import React from 'react';
import { TagIcon } from 'lucide-react';
interface CategoryBadgeProps {
  category: string;
}
const categoryColors: Record<string, {
  bg: string;
  text: string;
}> = {
  Citrus: {
    bg: 'bg-orange-100',
    text: 'text-orange-700'
  },
  Tropical: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-700'
  },
  Berry: {
    bg: 'bg-red-100',
    text: 'text-red-700'
  },
  'Pome Fruit': {
    bg: 'bg-green-100',
    text: 'text-green-700'
  },
  'Stone Fruit': {
    bg: 'bg-purple-100',
    text: 'text-purple-700'
  }
};
export function CategoryBadge({
  category
}: CategoryBadgeProps) {
  const colors = categoryColors[category] || {
    bg: 'bg-gray-100',
    text: 'text-gray-700'
  };
  return <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${colors.bg}`}>
      <TagIcon className={`w-4 h-4 ${colors.text}`} />
      <span className={`text-sm font-semibold ${colors.text}`}>{category}</span>
    </div>;
}