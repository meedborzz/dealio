import React from 'react';

interface Category {
  id: string;
  name: string;
}

interface CategoryChipsProps {
  categories: Category[];
  selectedCategory?: string;
  onSelectCategory: (categoryId: string) => void;
}

import { motion } from 'framer-motion';

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;

        return (
          <motion.button
            key={category.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(category.id)}
            className={`flex-shrink-0 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all shadow-sm ${isSelected
                ? 'brand-gradient text-white border-transparent'
                : 'glass-card text-muted-foreground'
              }`}
          >
            {category.name}
          </motion.button>
        );
      })}
    </div>
  );
};
