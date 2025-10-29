'use client';

import Link from 'next/link';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Activity,
  Wrench,
  Thermometer,
  Battery,
  AlertCircle,
  ArrowLeft,
  Gauge,
  Droplets,
  ClipboardList,
} from 'lucide-react';
import { useTranslation } from '@/components/translation-provider';

type QuickCheck = {
  icon: typeof AlertTriangle;
  title: string;
  description: string;
};

type Step = {
  icon: typeof Activity;
  title: string;
  actions: string[];
};

type TrailerCheck = {
  icon: typeof Droplets;
  title: string;
  points: string[];
};

const quickChecks: Record<'en' | 'pa', QuickCheck[]> = {
  en: [
    {
      icon: AlertTriangle,
      title: 'Dash warning lights',
      description:
        'Verify park brake is engaged and cycle ignition for 30 seconds. If lights remain, log the fault with photos.',
    },
    {
      icon: Wrench,
      title: 'Air leaks or low pressure',
      description:
        'Listen around glad hands, tanks, and service lines. Note PSI readings and whether the compressor is cycling rapidly.',
    },
    {
      icon: Thermometer,
      title: 'Overheating alerts',
      description:
        'Record gauge position, check coolant level via sight glass only, and look for visible leaks before shutting down.',
    },
    {
      icon: Gauge,
      title: 'Brake feel changes',
      description:
        'Test pedal response at low speed in a safe zone. Note air pressure levels, ABS lights, and any steering pull.',
    },
  ],
  pa: [
    {
      icon: AlertTriangle,
      title: 'ਡੈਸ਼ ਚੇਤਾਵਨੀ ਬੱਤੀਆਂ',
      description:
        'ਪੱਕਾ ਕਰੋ ਕਿ ਪਾਰਕ ਬਰੇਕ ਲੱਗੀ ਹੈ ਅਤੇ ਇਗਨੇਸ਼ਨ ਨੂੰ 30 ਸਕਿੰਟ ਲਈ ਆਫ਼-ਆਨ ਕਰੋ। ਜੇ ਬੱਤੀਆਂ ਰਹਿੰਦੀਆਂ ਹਨ ਤਾਂ ਫੋਟੋਆਂ ਨਾਲ ਮੁੱਦਾ ਲੋਗ ਕਰੋ।',
    },
    {
      icon: Wrench,
      title: 'ਹਵਾ ਦੇ ਰਿਸਾਅ ਜਾਂ ਘੱਟ ਦਬਾਅ',
      description:
        'ਗਲੈਡ ਹੈਂਡ, ਟੈਂਕ ਅਤੇ ਸਰਵਿਸ ਲਾਈਨਾਂ ਕੋਲ ਆਵਾਜ਼ ਸੁਣੋ। PSI ਪੜ੍ਹਤ ਅਤੇ ਕੰਪ੍ਰੈੱਸਰ ਦੇ ਤੇਜ਼ ਚਲਣ ਬਾਰੇ ਨੋਟ ਕਰੋ।',
    },
    {
      icon: Thermometer,
      title: 'ਓਵਰਹੀਟਿੰਗ ਚੇਤਾਵਨੀ',
      description:
        'ਗੇਜ ਦੀ ਸਥਿਤੀ ਦਰਜ ਕਰੋ, ਸਿਰਫ਼ ਸਾਈਟ ਗਲਾਸ ਰਾਹੀਂ ਕੂਲੈਂਟ ਪੱਧਰ ਜਾਂਚੋ ਅਤੇ ਬੰਦ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਰਿਸਾਅ ਵੇਖੋ।',
    },
    {
      icon: Gauge,
      title: 'ਬਰੇਕ ਦੇ ਅਹਿਸਾਸ ਵਿੱਚ ਤਬਦੀਲੀ',
      description:
        'ਸੁਰੱਖਿਅਤ ਇਲਾਕੇ ਵਿੱਚ ਹੌਲੀ ਗਤੀ ’ਤੇ ਪੈਡਲ ਜਾਂਚੋ। ਹਵਾ ਦਬਾਅ, ABS ਲਾਈਟਾਂ ਅਤੇ ਸਟੀਅਰਿੰਗ ਖਿੱਚ ਦੇ ਨੋਟ ਬਣਾਓ।',
    },
  ],
};

const troubleshootingSteps: Record<'en' | 'pa', Step[]> = {
  en: [
    {
      icon: Activity,
      title: 'Electrical resets',
      actions: [
        'Isolate batteries for 60 seconds using the main cut-off.',
        'Inspect fuses for moisture or loose seating.',
        'After reset, re-run start-up checks and note which lights return.',
      ],
    },
    {
      icon: Battery,
      title: 'Low voltage response',
      actions: [
        'Check jump pack availability and charge level.',
        'Capture voltage readings if a multimeter is on hand.',
        'Log any slow cranking or dim lighting symptoms.',
      ],
    },
    {
      icon: AlertCircle,
      title: 'When to escalate',
      actions: [
        'Stop driving immediately for brake, steering, or driveline faults.',
        'Call operations if the vehicle cannot move safely or reset attempts fail.',
        'Include location details and advise if tow support may be required.',
      ],
    },
  ],
  pa: [
    {
      icon: Activity,
      title: 'ਇਲੈਕਟ੍ਰਿਕਲ ਰੀਸੈੱਟ',
      actions: [
        'ਮੁੱਖ ਕਟ-ਆਫ਼ ਨਾਲ ਬੈਟਰੀਆਂ ਨੂੰ 60 ਸਕਿੰਟ ਲਈ ਅਲੱਗ ਕਰੋ।',
        'ਫਿਊਜ਼ਾਂ ਨੂੰ ਨਮੀ ਜਾਂ ਢਿੱਲੇ ਫਿੱਟ ਲਈ ਜਾਂਚੋ।',
        'ਰੀਸੈੱਟ ਤੋਂ ਬਾਅਦ ਸਟਾਰਟਅਪ ਚੈਕ ਦੁਬਾਰਾ ਚਲਾਓ ਅਤੇ ਕਿਹੜੀਆਂ ਬੱਤੀਆਂ ਵਾਪਸ ਆਈਆਂ ਨੋਟ ਕਰੋ।',
      ],
    },
    {
      icon: Battery,
      title: 'ਘੱਟ ਵੋਲਟੇਜ ਲਈ ਕਾਰਵਾਈ',
      actions: [
        'ਜੰਪ ਪੈਕ ਦੀ ਉਪਲਬਧਤਾ ਅਤੇ ਚਾਰਜ ਪੱਧਰ ਜਾਂਚੋ।',
        'ਜੇ ਮਲਟੀਮੀਟਰ ਹੈ ਤਾਂ ਵੋਲਟੇਜ ਪੜ੍ਹਤ ਦਰਜ ਕਰੋ।',
        'ਹੌਲੀ ਕ੍ਰੈਂਕਿੰਗ ਜਾਂ ਹਲਕੀ ਰੌਸ਼ਨੀ ਦੇ ਲੱਛਣ ਲਿਖੋ।',
      ],
    },
    {
      icon: AlertCircle,
      title: 'ਕਦੋਂ ਤੁਰੰਤ ਸੂਚਿਤ ਕਰਨਾ ਹੈ',
      actions: [
        'ਬਰੇਕ, ਸਟੀਅਰਿੰਗ ਜਾਂ ਡ੍ਰਾਈਵਲਾਈਨ ਖਰਾਬੀ ’ਤੇ ਵਾਹਨ ਫੌਰਨ ਰੋਕੋ।',
        'ਜੇ ਵਾਹਨ ਸੁਰੱਖਿਅਤ ਤੌਰ ’ਤੇ ਨਹੀਂ ਹਿੱਲ ਸਕਦਾ ਜਾਂ ਰੀਸੈੱਟ ਫੇਲ੍ਹ ਹੈ ਤਾਂ ਓਪਰੇਸ਼ਨ ਨੂੰ ਕਾਲ ਕਰੋ।',
        'ਸਥਾਨ ਦੀ ਜਾਣਕਾਰੀ ਦਿਓ ਅਤੇ ਦੱਸੋ ਕਿ ਕੀ ਟੋ ਸਹਾਇਤਾ ਦੀ ਲੋੜ ਹੋ ਸਕਦੀ ਹੈ।',
      ],
    },
  ],
};

const trailerChecks: Record<'en' | 'pa', TrailerCheck[]> = {
  en: [
    {
      icon: Droplets,
      title: 'Hydraulic & air connections',
      points: [
        'Inspect glad hands for seated seals and frost build-up.',
        'Check hydraulic lines for rub marks or fresh leaks.',
        'Confirm service and emergency lines are secure after re-couple.',
      ],
    },
    {
      icon: Wrench,
      title: 'Running gear walk-around',
      points: [
        'Check wheel nuts for loose indicators or shiny studs.',
        'Inspect suspension airbags for cuts or deflation.',
        'Verify landing legs and pins are stowed before moving.',
      ],
    },
    {
      icon: Gauge,
      title: 'Temperature-sensitive freight',
      points: [
        'Note reefer setpoint and return air temp before shutting unit down.',
        'Log fuel level and any alarms displayed on the controller.',
        'Capture cargo status or receiver feedback if available.',
      ],
    },
  ],
  pa: [
    {
      icon: Droplets,
      title: 'ਹਾਈਡ੍ਰੌਲਿਕ ਅਤੇ ਹਵਾ ਜੋੜ',
      points: [
        'ਗਲੈਡ ਹੈਂਡਾਂ ’ਤੇ ਸੀਲਾਂ ਅਤੇ ਬਰਫ਼ ਦੀ ਪਰਤ ਦੀ ਜਾਂਚ ਕਰੋ।',
        'ਹਾਈਡ੍ਰੌਲਿਕ ਲਾਈਨਾਂ ’ਤੇ ਰਗੜ ਦੇ ਨਿਸ਼ਾਨ ਜਾਂ ਨਵੇਂ ਰਿਸਾਅ ਵੇਖੋ।',
        'ਦੁਬਾਰਾ ਜੋੜਨ ਤੋਂ ਬਾਅਦ ਸਰਵਿਸ ਅਤੇ ਐਮਰਜੈਂਸੀ ਲਾਈਨਾਂ ਮਜ਼ਬੂਤ ਕਰੋ।',
      ],
    },
    {
      icon: Wrench,
      title: 'ਰਨਿੰਗ ਗੀਅਰ ਵਾਕ-ਅਰਾਊਂਡ',
      points: [
        'ਹੀਲ ਨੱਟਾਂ ’ਤੇ ਢਿੱਲੇ ਸੰਕੇਤਕ ਜਾਂ ਚਮਕੀਲੇ ਸਟੱਡ ਦੀ ਜਾਂਚ ਕਰੋ।',
        'ਸਸਪੈਂਸ਼ਨ ਏਅਰਬੈਗ ਵਿੱਚ ਕਟ ਜਾਂ ਹਵਾ ਕਮੀ ਵੇਖੋ।',
        'ਚਲਣ ਤੋਂ ਪਹਿਲਾਂ ਲੈਂਡਿੰਗ ਲੈਗ ਅਤੇ ਪਿੰਨ ਠੀਕ ਤਰ੍ਹਾਂ ਫੋਲਡ ਹਨ ਕਿ ਨਹੀਂ ਯਕੀਨੀ ਕਰੋ।',
      ],
    },
    {
      icon: Gauge,
      title: 'ਤਾਪਮਾਨ ਸੰਵੇਦਨਸ਼ੀਲ ਭਾੜਾ',
      points: [
        'ਯੂਨਿਟ ਬੰਦ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਰੀਫਰ ਸੈੱਟਪੌਇੰਟ ਅਤੇ ਵਾਪਸੀ ਹਵਾ ਤਾਪਮਾਨ ਦਰਜ ਕਰੋ।',
        'ਫਿਊਲ ਪੱਧਰ ਅਤੇ ਕੰਟਰੋਲਰ ’ਤੇ ਕੋਈ ਅਲਾਰਮ ਨੋਟ ਕਰੋ।',
        'ਉਪਲੱਬਧ ਹੋਣ ’ਤੇ ਕਾਰਗੋ ਦੀ ਸਥਿਤੀ ਜਾਂ ਰਿਸੀਵਰ ਫੀਡਬੈਕ ਦਰਜ ਕਰੋ।',
      ],
    },
  ],
};

const captureChecklist: Record<'en' | 'pa', string[]> = {
  en: [
    'Fleet number, trailer IDs, and current location (landmark or GPS).',
    'Dashboard messages or fault codes – attach photos if safe.',
    'Recent work completed or parts replaced that may be related.',
    'Is the unit driveable? Distance travelled since the issue appeared.',
    'Contact number during repair window and best time for call-back.',
  ],
  pa: [
    'ਬੇੜੇ ਦਾ ਨੰਬਰ, ਟ੍ਰੇਲਰ ID ਅਤੇ ਮੌਜੂਦਾ ਸਥਾਨ (ਲੈਂਡਮਾਰਕ ਜਾਂ GPS)।',
    'ਡੈਸ਼ਬੋਰਡ ਸੁਨੇਹੇ ਜਾਂ ਫਾਲਟ ਕੋਡ – ਜੇ ਸੰਭਵ ਹੋਵੇ ਤਾਂ ਫੋਟੋ ਜੋੜੋ।',
    'ਹਾਲ ਹੀ ਦਾ ਕੰਮ ਜਾਂ ਬਦਲੇ ਹਿੱਸੇ ਜੋ ਮੁੱਦੇ ਨਾਲ ਜੁੜੇ ਹੋ ਸਕਦੇ ਹਨ।',
    'ਕੀ ਯੂਨਿਟ ਚਲਣਯੋਗ ਹੈ? ਮੁੱਦਾ ਆਉਣ ਤੋਂ ਬਾਅਦ ਤਿਆ ਗਿਆ ਫਾਸਲਾ ਦਰਜ ਕਰੋ।',
    'ਮੁਰੰਮਤ ਖਿੜਕੀ ਦੌਰਾਨ ਸੰਪਰਕ ਨੰਬਰ ਅਤੇ ਵਾਪਸੀ ਕਾਲ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਸਮਾਂ।',
  ],
};

export default function TroubleshootPage() {
  const { locale, t } = useTranslation();
  const language = locale === 'pa' ? 'pa' : 'en';
  const quickList = quickChecks[language];
  const stepList = troubleshootingSteps[language];
  const trailerList = trailerChecks[language];
  const captureList = captureChecklist[language];
  const hotlineMessage = t.troubleshoot.callToAction.replace('{phone}', t.nav.hotlinePhone);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" suppressHydrationWarning>
      <Navigation />

      <main className="container mx-auto max-w-5xl px-4 py-16">
        <div className="mb-10">
          <Link
            href="/report"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
          >
            <ArrowLeft className="h-4 w-4" />
            {t.troubleshoot.backToReport}
          </Link>
        </div>

        <header className="mb-12 space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-blue-200/70 bg-blue-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
            {t.troubleshoot.title}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl dark:text-white">
            {t.troubleshoot.heading}
          </h1>
          <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">{t.troubleshoot.intro}</p>
        </header>

        <section className="mb-12 space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t.troubleshoot.immediateChecks}</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {quickList.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="h-full rounded-3xl border border-slate-200/70 bg-white/95 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <CardContent className="space-y-4 p-6">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-300">{item.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t.troubleshoot.stepGuidance}</h2>
          <div className="space-y-6">
            {stepList.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="rounded-3xl border border-slate-200/70 bg-white/95 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <span className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200/50 text-blue-600 dark:bg-slate-800 dark:text-blue-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div className="space-y-3">
                        <p className="text-lg font-semibold text-slate-900 dark:text-white">{item.title}</p>
                        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                          {item.actions.map((action) => (
                            <li key={action} className="relative pl-4">
                              <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-300" />
                              {action}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t.troubleshoot.trailerHeading}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">{t.troubleshoot.trailerIntro}</p>
          <div className="grid gap-6 md:grid-cols-3">
            {trailerList.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="h-full rounded-3xl border border-slate-200/70 bg-white/95 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/80"
                >
                  <CardContent className="space-y-4 p-6">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="space-y-2">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        {item.points.map((point) => (
                          <li key={point} className="relative pl-4">
                            <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-300" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="mt-12 space-y-6">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">{t.troubleshoot.captureHeading}</h2>
          <Card className="rounded-3xl border border-slate-200/70 bg-white/95 shadow-lg shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/80">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-start gap-4">
                <span className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-slate-200/50 text-blue-600 dark:bg-slate-800 dark:text-blue-300">
                  <ClipboardList className="h-5 w-5" />
                </span>
                <div className="space-y-3">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">{t.troubleshoot.captureIntro}</p>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {captureList.map((item) => (
                      <li key={item} className="relative pl-4">
                        <span className="absolute left-0 top-2 h-1.5 w-1.5 rounded-full bg-blue-500 dark:bg-blue-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="mt-12 flex flex-col gap-3 rounded-3xl border border-blue-200/70 bg-blue-50/70 p-6 text-sm text-blue-900 shadow-lg dark:border-blue-900/40 dark:bg-blue-900/30 dark:text-blue-100">
          <p className="text-xs font-semibold uppercase tracking-[0.35em]">{t.troubleshoot.stillStuck}</p>
          <p>{hotlineMessage}</p>
          <div>
            <Link href="/report">
              <Button className="mt-2 rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400">
                {t.troubleshoot.returnToReport}
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer className="mt-16" />
    </div>
  );
}

