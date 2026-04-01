"use client";
import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertyMapModule from '@/components/PropertyMapModule';

function MapModulePageInner() {
  const searchParams = useSearchParams();
  const userFormId = searchParams?.get('userFormId') || null;
  return <PropertyMapModule userFormId={userFormId} />;
}

export default function MapModulePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <MapModulePageInner />
    </Suspense>
  );
}
