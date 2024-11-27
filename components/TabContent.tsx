// components/TabContent.tsx
import { memo, useEffect, useState } from 'react';
import { useTabStore } from '@/stores/tab-store';

interface TabContentProps {
  id: string;
  isActive: boolean;
  lazyComponent?: () => Promise<{ default: React.ComponentType }>;
}

export const TabContent = memo(({ id, isActive, lazyComponent }: TabContentProps) => {
  const { renderedComponents, setRenderedComponent } = useTabStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadComponent = async () => {
      if (!renderedComponents[id] && lazyComponent) {
        setLoading(true);
        try {
          const { default: Component } = await lazyComponent();
          setRenderedComponent(id, <Component />);
        } catch (error) {
          console.error('Failed to load component:', error);
        }
        setLoading(false);
      }
    };

    if (isActive) {
      loadComponent();
    }
  }, [id, isActive, lazyComponent, renderedComponents, setRenderedComponent]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div
      className="tab-content h-full"
      style={{ display: isActive ? 'block' : 'none' }}
    >
      {renderedComponents[id]}
    </div>
  );
});

TabContent.displayName = 'TabContent';
