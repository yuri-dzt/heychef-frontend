import React, { useState } from 'react';
import { XIcon, PlusIcon } from 'lucide-react';

interface IngredientsInputProps {
  value: string[];
  onChange: (ingredients: string[]) => void;
  label?: string;
}

export function IngredientsInput({ value, onChange, label }: IngredientsInputProps) {
  const [input, setInput] = useState('');

  const addIngredient = () => {
    const trimmed = input.trim();
    if (!trimmed || value.includes(trimmed)) return;
    onChange([...value, trimmed]);
    setInput('');
  };

  const removeIngredient = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      )}

      {/* Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((ingredient, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-light text-primary text-sm rounded-lg"
            >
              {ingredient}
              <button
                type="button"
                onClick={() => removeIngredient(index)}
                className="hover:text-primary-hover"
              >
                <XIcon className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addIngredient();
            }
          }}
          placeholder="Ex: Pão brioche, Carne 180g..."
          className="flex-1 rounded-lg border border-border p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
        <button
          type="button"
          onClick={addIngredient}
          disabled={!input.trim()}
          className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xs text-text-muted mt-1">Pressione Enter para adicionar</p>
    </div>
  );
}
