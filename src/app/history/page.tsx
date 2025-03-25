'use client';

import { Card } from '@/app/components/ui/card';

export default function HistoryPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Weather History</h1>
      <Card className="p-4">
        <div className="min-h-[500px] flex items-center justify-center">
          <p className="text-muted-foreground">Weather History Coming Soon...</p>
        </div>
      </Card>
    </div>
  );
} 