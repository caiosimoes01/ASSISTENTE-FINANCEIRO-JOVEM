export default function Header() {
  return (
    <header className="max-w-7xl mx-auto px-5 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between">
      <div className="flex flex-col">
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          YoungFinance
        </h1>
        <span className="text-xs md:text-sm font-medium text-zinc-400 block mt-0.5">
          seu assistente financeiro
        </span>
      </div>
    </header>
  );
}
