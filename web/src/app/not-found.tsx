import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-canvas">
      <div className="container-wide section-padding text-center">
        <p className="caption-uppercase text-muted mb-4">404</p>
        <h1 className="display-lg mb-4">Presence Not Found</h1>
        <p className="body-md text-muted mb-8">
          This presence doesn't exist or has been removed.
        </p>
        <Link href="/presences" className="btn-primary no-underline">
          Back to Gallery
        </Link>
      </div>
    </div>
  );
}
