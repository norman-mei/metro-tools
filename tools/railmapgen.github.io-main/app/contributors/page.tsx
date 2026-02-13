'use client';

import dynamic from 'next/dynamic';

const ContributorsClientApp = dynamic(() => import('../../src/next/contributors-client-app'), {
    ssr: false,
});

export default function ContributorsPage() {
    return <ContributorsClientApp />;
}
