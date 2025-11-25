export function Header() {
  return (
    <header className="flex items-center justify-between">
      <h2 className="text-2xl font-semibold">Bienvenue sur IALynk</h2>
      <div className="flex items-center space-x-3">
        <span className="text-gray-600">Agence Demo</span>
        <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold">
          R
        </div>
      </div>
    </header>
  );
}
