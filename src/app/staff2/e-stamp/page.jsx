"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EStampApplication from '@/components/EStampApplication';

function EStampPageInner() {
  const searchParams = useSearchParams();
  const userFormId = searchParams?.get('userFormId') || null;
  return <EStampApplication userFormId={userFormId} />;
}

export default function EStampPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    }>
      <EStampPageInner />
    </Suspense>
  );
}
