import '../src/index.css';

export const metadata = {
    title: 'Rail Map Painter',
    description: 'Rail map drawing application',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
