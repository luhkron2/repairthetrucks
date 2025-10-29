import { SupportedLocale } from './dictionaries';

export const inlineTranslationMap: Partial<Record<SupportedLocale, Record<string, string>>> = {
  pa: {
    'Fields marked with * are required for a successful submission.': "ਜਿਨ੍ਹਾਂ ਖੇਤਰਾਂ ’ਤੇ * ਹੈ ਉਹ ਲਾਜ਼ਮੀ ਹਨ।",
    'Offline queue': 'ਆਫ਼ਲਾਈਨ ਕਤਾਰ',
    'Reports waiting to sync': 'ਸਿੰਕ ਲਈ ਉਡੀਕ ਰਹੀਆਂ ਰਿਪੋਰਟਾਂ',
    'You are currently offline.': 'ਤੁਸੀਂ ਇਸ ਵੇਲੇ ਆਫ਼ਲਾਈਨ ਹੋ।',
    'You are connected.': 'ਤੁਸੀਂ ਕਨੈਕਟਡ ਹੋ।',
    'The report will stay queued on this device and auto-submit once the network is restored.':
      'ਰਿਪੋਰਟ ਇਸ ਡਿਵਾਈਸ ’ਤੇ ਕਤਾਰ ਵਿੱਚ ਰਹੇਗੀ ਅਤੇ ਨੈੱਟਵਰਕ ਮੁੜ ਆਉਣ ’ਤੇ ਆਪੇ ਜਮ੍ਹਾਂ ਹੋ ਜਾਵੇਗੀ।',
    'Syncing': 'ਸਿੰਕ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ',
    'pending offline report': 'ਬਕਾਇਆ ਆਫ਼ਲਾਈਨ ਰਿਪੋਰਟ',
    'pending offline reports': 'ਬਕਾਇਆ ਆਫ਼ਲਾਈਨ ਰਿਪੋਰਟਾਂ',
    'in the background.': 'ਪਿਛੋਕੜ ਵਿਚ।',
    'Submissions will be processed instantly and routed to operations.':
      'ਜਮ੍ਹਾਂ ਕੀਤੀਆਂ ਰਿਪੋਰਟਾਂ ਤੁਰੰਤ ਪ੍ਰਕਿਰਿਆ ਵਿੱਚ ਆ ਕੇ ਓਪਰੇਸ਼ਨ ਵੱਲ ਭੇਜੀਆਂ ਜਾਣਗੀਆਂ।',
    'Use GPS': 'GPS ਵਰਤੋਂ',
    'Auto-fill known details': 'ਮੌਜੂਦਾ ਜਾਣਕਾਰੀ ਭਰੋ',
    'Retry sending offline reports': 'ਆਫ਼ਲਾਈਨ ਰਿਪੋਰਟਾਂ ਮੁੜ ਭੇਜੋ',
    'GPS position captured': 'GPS ਸਥਿਤੀ ਪ੍ਰਾਪਤ ਹੋਈ',
    'Failed to get location': 'ਟਿਕਾਣਾ ਪ੍ਰਾਪਤ ਨਹੀਂ ਹੋ ਸਕਿਆ',
    'Data not loaded yet': 'ਡਾਟਾ ਹਾਲੇ ਲੋਡ ਨਹੀਂ ਹੋਇਆ',
    'Auto-filled {count} field': '{count} ਖੇਤਰ ਆਪਣੇ ਆਪ ਭਰਿਆ ਗਿਆ',
    'Auto-filled {count} fields': '{count} ਖੇਤਰ ਆਪਣੇ ਆਪ ਭਰੇ ਗਏ',
    'No data available to auto-fill. Please select a fleet number or driver first.':
      'ਆਟੋ-ਫ਼ਿਲ ਲਈ ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ। ਪਹਿਲਾਂ ਬੇੜਾ ਨੰਬਰ ਜਾਂ ਡਰਾਈਵਰ ਚੁਣੋ।',
    'Workshop control': 'ਵਰਕਸ਼ਾਪ ਕੰਟਰੋਲ',
    'Keep every vehicle rolling.': 'ਹਰ ਵਾਹਨ ਨੂੰ ਚਾਲੂ ਰੱਖੋ।',
    'Log downtime instantly, assign the right workshop, and monitor handover readiness without leaving the screen.':
      'ਡਾਊਨਟਾਈਮ ਤੁਰੰਤ ਲੋਗ ਕਰੋ, ਸਹੀ ਵਰਕਸ਼ਾਪ ਨਿਰਧਾਰਤ ਕਰੋ ਅਤੇ ਇਕੋ ਸਕ੍ਰੀਨ ’ਤੇ ਹੇਂਡਓਵਰ ਤਿਆਰੀ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ।',
    'Log downtime': 'ਡਾਊਨਟਾਈਮ ਲੋਗ ਕਰੋ',
    'Open live ops': 'ਲਾਈਵ ਓਪਰੇਸ਼ਨ ਖੋਲ੍ਹੋ',
    'Active tickets': 'ਸਰਗਰਮ ਟਿਕਟਾਂ',
    'being serviced': 'ਸੇਵਾ ਹੇਠ',
    'Critical repairs': 'ਗੰਭੀਰ ਮੁਰੰਮਤਾਂ',
    'Flag now': 'ਤੁਰੰਤ ਫਲੈਗ ਕਰੋ',
    'All clear': 'ਸਭ ਠੀਕ',
    'Ready for pickup': 'ਉਠਾਉ ਲਈ ਤਿਆਰ',
    'Ready to roll': 'ਚਲਣ ਲਈ ਤਿਆਰ',
    'Awaiting jobs': 'ਕਾਮ ਦੀ ਉਡੀਕ',
    'Live workshop control': 'ਲਾਈਵ ਵਰਕਸ਼ਾਪ ਕੰਟਰੋਲ',
    'Today\'s signals': 'ਅੱਜ ਦੇ ਸੰਕੇਤ',
    'Ticket load, urgent repairs, and ready assets at a glance.':
      'ਟਿਕਟ ਭਾਰ, ਤੁਰੰਤ ਮੁਰੰਮਤਾਂ ਅਤੇ ਤਿਆਰ ਅਸੈੱਟ ਇੱਕ ਨਜ਼ਰ ਵਿੱਚ।',
    'Active queue': 'ਸਰਗਰਮ ਕਤਾਰ',
    'No active repairs right now.': 'ਫਿਲਹਾਲ ਕੋਈ ਮੁਰੰਮਤ ਨਹੀਂ।',
    'Fleet pipeline snapshot': 'ਬੇੜਾ ਪਾਈਪਲਾਈਨ ਝਲਕ',
    'Quick pulse of every stage.': 'ਹਰ ਪੜਾਅ ਦੀ ਤੇਜ਼ ਸਥਿਤੀ।',
    'Explore operations dashboard': 'ਓਪਰੇਸ਼ਨ ਡੈਸ਼ਬੋਰਡ ਵੇਖੋ',
    'Latest workshop updates': 'ਤਾਜ਼ਾ ਵਰਕਸ਼ਾਪ ਅੱਪਡੇਟ',
    'Fresh notes from the floor.': 'ਵਰਕਸ਼ਾਪ ਤੋਂ ਤਾਜ਼ਾ ਨੋਟਾਂ।',
    'View detailed run sheet': 'ਵਿਸਥਾਰਤ ਰਨ ਸ਼ੀਟ ਦੇਖੋ',
    'Ticket': 'ਟਿਕਟ',
    'Fleet': 'ਬੇੜਾ',
    'Status': 'ਸਥਿਤੀ',
    'Severity': 'ਗੰਭੀਰਤਾ',
    'Latest update': 'ਤਾਜ਼ਾ ਅੱਪਡੇਟ',
    'Updated': 'ਅੱਪਡੇਟ',
    'No active repairs at the moment.': 'ਇਸ ਵੇਲੇ ਕੋਈ ਸਰਗਰਮ ਮੁਰੰਮਤ ਨਹੀਂ ਹੈ।',
    'Prime Registration': 'ਟਰੱਕ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    'Select trailer A': 'ਟ੍ਰੇਲਰ A ਚੁਣੋ',
    'Select trailer B': 'ਟ੍ਰੇਲਰ B ਚੁਣੋ',
    'Location': 'ਟਿਕਾਣਾ',
    'Need help?': 'ਮਦਦ ਦੀ ਲੋੜ ਹੈ?',
    'Call the operations desk if the vehicle is unsafe or you need support completing the form.':
      'ਜੇ ਵਾਹਨ ਅਸੁਰੱਖਿਅਤ ਹੈ ਜਾਂ ਫਾਰਮ ਭਰਨ ਲਈ ਸਹਾਇਤਾ ਚਾਹੀਦੀ ਹੈ ਤਾਂ ਓਪਰੇਸ਼ਨ ਡੈਸਕ ਨਾਲ ਸੰਪਰਕ ਕਰੋ।',
    'After working hours, contact the duty manager. Critical issues should be escalated immediately.':
      'ਕੰਮ ਦੇ ਸਮੇਂ ਤੋਂ ਬਾਹਰ ਡਿਊਟੀ ਮੈਨੇਜਰ ਨਾਲ ਸੰਪਰਕ ਕਰੋ। ਗੰਭੀਰ ਮਾਮਲੇ ਤੁਰੰਤ ਐਸਕਲੇਟ ਕਰੋ।',
    'Security & compliance': 'ਸੁਰੱਖਿਆ ਅਤੇ ਅਨੁਸਾਰਤਾ',
    'Support': 'ਸਹਾਇਤਾ',
    'Incident response': 'ਘਟਨਾ ਜਵਾਬ',
    'Report downtime': 'ਡਾਊਨਟਾਈਮ ਰਿਪੋਰਟ ਕਰੋ',
    'Workshop intake': 'ਵਰਕਸ਼ਾਪ ਇੰਟੇਕ',
    'Access control': 'ਪਹੁੰਚ ਨਿਯੰਤਰਣ',
    'About SE Repairs': 'SE ਮੁਰੰਮਤ ਬਾਰੇ',
    'Security': 'ਸੁਰੱਖਿਆ',
    'Strategic Equipment Repairs': 'ਸਟ੍ਰੈਟਜਿਕ ਇਕੁਇਪਮੈਂਟ ਮੁਰੰਮਤ',
    'The single source of truth for workshop schedules, compliance trails, and executive-ready repair reporting.':
      'ਵਰਕਸ਼ਾਪ ਸ਼ਡਿਊਲ, ਕੰਪਲਾਇਅੰਸ ਰਿਕਾਰਡ ਅਤੇ ਪ੍ਰਬੰਧਕੀ ਰਿਪੋਰਟਿੰਗ ਲਈ ਇਕੋ ਭਰੋਸੇਯੋਗ ਸਰੋਤ।',
    'Severity Breakdown': 'ਗੰਭੀਰਤਾ ਵਿਭਾਗ',
    'Current issue distribution by priority level': 'ਮੌਜੂਦਾ ਮੁੱਦਿਆਂ ਦੀ ਪ੍ਰਾਥਮਿਕਤਾ ਅਨੁਸਾਰ ਵੰਡ',
    'Pending': 'ਬਕਾਇਆ',
    'In Progress': 'ਚਲ ਰਹੇ',
    'Scheduled': 'ਤਹਿ-ਸ਼ੁਦਾ',
    'Completed': 'ਪੂਰੇ ਹੋਏ',
    'LOW': 'ਘੱਟ',
    'MEDIUM': 'ਦਰਮਿਆਨਾ',
    'HIGH': 'ਉੱਚਾ',
    'CRITICAL': 'ਗੰਭੀਰ',
  },
};

export function translateInline(text: string, locale: SupportedLocale): string {
  if (locale === 'en') return text;
  const map = inlineTranslationMap[locale];
  return map?.[text] ?? text;
}


