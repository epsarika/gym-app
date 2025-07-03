export default function PageHeader({ title, left = null, right = null }) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-black pt-2">
      <div className="max-w-screen-lg mx-auto px-4 md:px-6 py-3 md:py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {left}
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
        <div className="flex items-center">{right}</div>
      </div>
    </header>
  );
}
