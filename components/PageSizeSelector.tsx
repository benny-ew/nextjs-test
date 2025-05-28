import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface PageSizeSelectorProps {
  currentPageSize: number;
  onPageSizeChange: (size: number) => void;
  loading?: boolean;
}

export const PageSizeSelector = ({ currentPageSize, onPageSizeChange, loading = false }: PageSizeSelectorProps) => {
  const pageSizeOptions = [5, 10, 20, 50];

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Items per page:</span>
          </div>
          <div className="flex gap-1">
            {pageSizeOptions.map((size) => (
              <Button
                key={size}
                variant={size === currentPageSize ? "default" : "outline"}
                size="sm"
                onClick={() => onPageSizeChange(size)}
                disabled={loading}
                className="min-w-[2.5rem]"
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
