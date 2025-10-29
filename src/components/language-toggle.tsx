'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';

export function LanguageToggle() {
  const { locale, setLocale, t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const nextLocale = locale === 'en' ? 'pa' : 'en';
  const label = locale === 'en' ? t.language.punjabi : t.language.english;

  const handleToggle = () => {
    if (loading) return;
    setLoading(true);
    setLocale(nextLocale);
    // Small timeout to give feedback while UI re-renders with new strings
    setTimeout(() => setLoading(false), 150);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={loading}
      className="rounded-full border-slate-300 px-3 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-slate-600 hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:text-blue-200"
      aria-label={label}
      title={label}
      data-active-locale={locale}
    >
      <Languages className="h-4 w-4" />
      {loading ? '...' : label}
    </Button>
  );
}
