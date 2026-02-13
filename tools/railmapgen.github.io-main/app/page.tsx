'use client';

import dynamic from 'next/dynamic';

const MainClientApp = dynamic(() => import('../src/next/main-client-app'), {
    ssr: false,
});

export default function Page() {
    return <MainClientApp />;
}
