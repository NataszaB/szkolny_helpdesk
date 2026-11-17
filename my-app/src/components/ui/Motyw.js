'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const [ciemny, setCiemny] = useState(false);


  useEffect(() => {
    const zapisany = localStorage.getItem('motyw');
    if (zapisany === 'dark') {
      document.documentElement.classList.add('dark');
      setCiemny(true);
    }
  }, []);

  function przelaczMotyw() {
    if (ciemny) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('motyw', 'light');
      setCiemny(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('motyw', 'dark');
      setCiemny(true);
    }
  }

  return (
    <Button variant="outline" onClick={przelaczMotyw}>
      {ciemny ? 'Jasny' : 'Ciemny'}
    </Button>
  );
}