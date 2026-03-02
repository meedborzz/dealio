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

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const isSelected = selectedCategory === category.id;

        return (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              isSelected
                ? 'bg-primary/20 border-primary/30 text-primary shadow-sm'
                : 'bg-card border-border text-muted-foreground hover:bg-muted hover:border-border/80'
            }`}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
};
