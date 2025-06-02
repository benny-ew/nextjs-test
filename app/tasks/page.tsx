import { KanbanBoard } from "@/components/KanbanBoard";
import { AuthGuard } from "@/components/AuthGuard";
import { UserProfile } from "@/components/UserProfile";
import { ThemeToggle } from "@/components/theme-toggle";

export default function TasksPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Task Board</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage your tasks efficiently</p>
              </div>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <UserProfile />
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8">
          <KanbanBoard />
        </main>
      </div>
    </AuthGuard>
  );
}
