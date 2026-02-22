import { useState } from 'react';
import { ListTodo, Plus } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { Header } from '@/components/Header';
import { getTrainerTodos, addTrainerTodo, toggleTrainerTodo } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface TrainerTodoListPageProps {
  onBack: () => void;
}

export function TrainerTodoListPage({ onBack }: TrainerTodoListPageProps) {
  const { auth } = useAuth();
  const trainerId = auth.status === 'trainer' ? auth.userId : 't1';
  const todos = getTrainerTodos(trainerId);
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = () => {
    if (newTodo.trim()) {
      addTrainerTodo({ trainerId, text: newTodo.trim(), done: false });
      setNewTodo('');
    }
  };

  return (
    <div className="min-h-screen pb-24">
      <Header title="To-Do List" subtitle="Your tasks" showBack onBack={onBack} />

      <div className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-4 py-3 rounded-2xl bg-white/50 border border-white/60 text-[var(--foreground)]"
          />
          <GlassButton leftIcon={<Plus className="w-4 h-4" />} onClick={handleAdd} disabled={!newTodo.trim()}>
            Add
          </GlassButton>
        </div>

        <div className="space-y-2">
          {todos.length > 0 ? (
            todos.map((t) => (
              <GlassCard key={t.id} className="p-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleTrainerTodo(t.id)}
                    className="w-6 h-6 rounded-md border-2 border-[var(--primary)] flex items-center justify-center flex-shrink-0"
                  >
                    {t.done && <div className="w-3 h-3 rounded-sm bg-[var(--primary)]" />}
                  </button>
                  <span
                    className={cn(
                      'flex-1 text-[var(--foreground)]',
                      t.done && 'line-through text-[var(--muted-foreground)]'
                    )}
                  >
                    {t.text}
                  </span>
                </div>
              </GlassCard>
            ))
          ) : (
            <GlassCard className="p-8 text-center">
              <ListTodo className="w-12 h-12 text-[var(--muted-foreground)] mx-auto mb-3 opacity-50" />
              <p className="text-[var(--muted-foreground)]">No tasks yet. Add one above.</p>
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
