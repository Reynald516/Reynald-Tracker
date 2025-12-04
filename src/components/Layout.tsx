export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full px-4 py-10">
      <div className="max-w-4xl mx-auto 
                      bg-white/10 dark:bg-black/30 
                      backdrop-blur-xl 
                      rounded-2xl p-8 
                      shadow-xl border border-white/10 
                      space-y-10">
        {children}
      </div>
    </div>
  );
}