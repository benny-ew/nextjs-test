import { KanbanBoard } from "@/components/KanbanBoard";
import { AuthGuard } from "@/components/AuthGuard";
import { UserProfile } from "@/components/UserProfile";

export default function Home() {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        <div className="container mx-auto px-4 py-8">
          {/* Header with user profile */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Task Board</h1>
              <p className="text-gray-600 mt-1">Manage your tasks efficiently</p>
            </div>
            <UserProfile />
          </div>
          
          <KanbanBoard />
        </div>
      </div>
    </AuthGuard>
  );
}
