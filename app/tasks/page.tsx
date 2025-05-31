import { KanbanBoard } from "@/components/KanbanBoard";
import { AuthGuard } from "@/components/AuthGuard";
import { UserProfile } from "@/components/UserProfile";

export default function TasksPage() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
                <p className="text-gray-600">Manage your tasks efficiently</p>
              </div>
              <UserProfile />
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
