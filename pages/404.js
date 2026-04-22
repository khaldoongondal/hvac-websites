export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md">
        <div className="text-8xl font-black text-slate-200 mb-4">404</div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">
          This preview has expired
        </h1>
        <p className="text-slate-500 mb-8 leading-relaxed">
          The page you&apos;re looking for is no longer available or has not been published yet.
        </p>
        <a
          href="https://localgrowthstudio.com"
          className="inline-block bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-700 transition-colors"
        >
          Contact Local Growth Studio
        </a>
      </div>
    </div>
  )
}
