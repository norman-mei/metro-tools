'use client';

import dynamic from 'next/dynamic';

const RuntimeDemoClientApp = dynamic(() => import('../../src/next/runtime-demo-client-app'), {
    ssr: false,
});

export default function RuntimeDemoPage() {
    return <RuntimeDemoClientApp />;
}
