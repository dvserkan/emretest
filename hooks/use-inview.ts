import { useEffect, useState, useRef } from 'react';

export function useInView(options = {}) {
    const [isInView, setIsInView] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                // Element görünür olduğunda veya görünürlükten çıktığında state'i güncelle
                setIsInView(entry.isIntersecting);
            },
            {
                root: null,
                // Daha erken yükleme için margin değerini artır
                rootMargin: '50px',
                // Daha az element görünür olduğunda tetiklensin
                threshold: 0.01,
                ...options
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [options]);

    return [ref, isInView] as const;
}
