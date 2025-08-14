export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">My Navy Budget</h1>
      <p className="text-gray-600 mb-8">Track your pay, budget, and retirement projections.</p>

      <div className="flex gap-4">
        <a href="/pay" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Pay Calculator
        </a>
        <a href="/budget" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
          Budget Tracker
        </a>
      </div>
    </main>
  );
}
