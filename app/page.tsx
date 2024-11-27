import { HomeIcon } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="flex items-center gap-2">
        <HomeIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Welcome to Next.js</h1>
      </div>
      <p className="mt-4 text-center text-gray-600">
        Get started by editing app/page.tsx
      </p>
    </main>
  );
}