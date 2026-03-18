export default function NotFound() {
    return (
        <div className="container mx-auto py-16 md:py-20 text-center">
            <h1 className="text-6xl font-bold mb-4">404</h1>
            <p className="text-2xl mb-8">Page Not Found</p>
            <a href="/" className="text-primary hover:underline">
                Go back home
            </a>
        </div>
    );
}
