import React from 'react';

interface TabContentWrapperProps {
    children: React.ReactNode;
}

export function TabContentWrapper({ children }: TabContentWrapperProps) {
    return (
        <div className="h-[calc(100vh-12rem)] overflow-hidden">
            <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent 
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-track]:bg-transparent
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80"
            >
                {children}
            </div>
        </div>
    );
}
