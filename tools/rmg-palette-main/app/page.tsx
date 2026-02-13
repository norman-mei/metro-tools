'use client';

import dynamic from 'next/dynamic';

const ClientApp = dynamic(() => import('../src/next/client-app'), {
    ssr: false,
});

export default function Page() {
    return <ClientApp />;
}
