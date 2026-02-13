import '../src/index.css';

export const metadata = {
    title: 'Rail Map Toolkit',
    description: 'Rail map toolkit web applications.',
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
