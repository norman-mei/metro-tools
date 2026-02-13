import '../src/index.css';

export const metadata = {
    title: 'RMG Palette',
    description: 'Palette resource management for Rail Map Generator.',
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
