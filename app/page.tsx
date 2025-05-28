import { KanbanBoard } from "@/components/KanbanBoard";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <KanbanBoard />
      </div>
    </div>
  );
}
