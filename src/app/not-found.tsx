import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x flex min-h-screen flex-col items-start justify-center">
      <p className="kicker">404</p>
      <h1 className="display mt-4 text-5xl">This page lost its edge.</h1>
      <Link href="/en" className="mt-8 text-sm text-forest underline">
        Back to home
      </Link>
    </div>
  );
}
