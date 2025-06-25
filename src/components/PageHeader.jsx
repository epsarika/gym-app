export default function PageHeader({ title, left = null, right = null }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white pt-2">
      <div className="max-w-md mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {left}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {right}
      </div>
    </header>
  );
}
