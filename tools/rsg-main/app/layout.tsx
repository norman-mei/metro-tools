import '../src/index.css';

export const metadata = {
    title: 'Rail Sign Generator',
    description: 'Rail sign generator for Rail Map Toolkit.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.HTMLAttributes<HTMLDivElement>['children'];
}>) {
    return (
        <html lang="en">
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    );
}
