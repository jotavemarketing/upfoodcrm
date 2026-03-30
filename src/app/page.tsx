import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Link
        href="/dashboard"
        className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white hover:bg-primary-dark"
      >
        Acessar Dashboard
      </Link>
    </div>
  );
}
