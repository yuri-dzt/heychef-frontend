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

  const removeIngredient = (ingredient: string) => {
    onChange(value.filter((item) => item !== ingredient));
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      )}

      {/* Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((ingredient) => (
            <span
              key={ingredient}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-light text-primary-strong text-sm rounded-lg"
            >
              {ingredient}
              <button
                type="button"
                onClick={() => removeIngredient(ingredient)}
                aria-label={`Remover ${ingredient}`}
                className="p-0.5 hover:text-primary-hover"
              >
                <XIcon className="w-3.5 h-3.5" aria-hidden="true" />
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
          aria-label="Adicionar ingrediente"
          className="flex-1 rounded-lg border border-border p-2.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none"
        />
        <button
          type="button"
          onClick={addIngredient}
          disabled={!input.trim()}
          aria-label="Adicionar ingrediente"
          className="px-3 min-h-[44px] min-w-[44px] flex items-center justify-center bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <PlusIcon className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
      <p className="text-xs text-text-muted mt-1">Pressione Enter para adicionar</p>
    </div>
  );
}
