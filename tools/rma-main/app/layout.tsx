import type { Metadata } from 'next';
import type { ReactNode } from 'react';
// eslint-disable-next-line import/no-unassigned-import
import '../src/index.css';

export const metadata: Metadata = {
    title: 'Rail Map Announcer',
    description: 'Generate the rail announcement from your rmg project.',
};

export default function RootLayout(props: { children: ReactNode }) {
    const { children } = props;

    return (
        <html lang="en">
            <body>
                <div id="root">{children}</div>
            </body>
        </html>
    );
}
