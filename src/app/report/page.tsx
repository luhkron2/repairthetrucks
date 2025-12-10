'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UploadZone } from '@/components/upload-zone';
import { fetchMappings, type MappingsCache } from '@/lib/mappings';
import { queueIssue, retryQueue, getQueueLength } from '@/lib/offline';
import { toast } from 'sonner';
import { Loader2, MapPin, Wifi, WifiOff, RefreshCw, UploadCloud, Phone, AlertCircle, Wrench, Thermometer, AlertTriangle, ArrowRight, Truck } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { useTranslation } from '@/components/translation-provider';
import { QuickActionsMenu } from '@/components/quick-actions-menu';
import { ThemeToggle } from '@/components/theme-toggle';

const reportSchema = z.object({
  driverName: z.string().min(1, 'Driver name is required'),
  driverPhone: z.string().optional(),
  fleetNumber: z.string().min(1, 'Fleet number is required'),
  primeRego: z.string().optional(),
  trailerA: z.string().optional(),
  trailerB: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  description: z.string().min(10, 'Description must be at least 10 characters'), 
  location: z.string().optional(),
  safeToContinue: z.string().optional(),
  preferredFrom: z.string().optional(),
  preferredTo: z.string().optional(),
});

type ReportForm = z.infer<typeof reportSchema>;

const MAPPINGS_CACHE_KEY = 'se-repairs:mappings:v1';

const isActiveStatus = (status?: string | null) => {
  if (!status) return true;
  return status.trim().toLowerCase() === 'active';
};

export default function ReportPage() {
  const router = useRouter();
  const { t, translate } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [mappings, setMappings] = useState<MappingsCache | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [queueLength, setQueueLength] = useState(0);
  
  // Get dropdown data from database mappings
  const fleetNumbers = mappings
    ? Object.keys(mappings.fleets)
        .filter((fleet) => isActiveStatus(mappings.fleets[fleet]?.status))
        .sort()
    : [];
  const trailerAOptions = mappings
    ? Object.keys(mappings.trailers || {})
        .filter((trailer) => {
          const trailerData = mappings.trailers?.[trailer];
          return trailerData?.type === 'Trailer A' && isActiveStatus(trailerData?.status);
        })
        .sort()
    : [];
  const trailerBOptions = mappings
    ? Object.keys(mappings.trailers || {})
        .filter((trailer) => {
          const trailerData = mappings.trailers?.[trailer];
          return trailerData?.type === 'Trailer B' && isActiveStatus(trailerData?.status);
        })
        .sort()
    : [];
  const drivers = mappings
    ? Object.keys(mappings.drivers)
        .filter((driver) => isActiveStatus(mappings.drivers[driver]?.status))
        .sort()
    : [];

  const { register, control, handleSubmit, formState: { errors }, setValue, watch } = useForm<ReportForm>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      driverName: '',
      driverPhone: '',
      fleetNumber: '',
      primeRego: '',
      trailerA: '',
      trailerB: '',
      category: '',
      severity: 'MEDIUM',
      safeToContinue: 'Yes',
      description: '',
      location: '',
      preferredFrom: '',
      preferredTo: '',
    },
  });

  const refreshQueueLength = useCallback(async () => {
    if (typeof window === 'undefined') return;
    try {
      const count = await getQueueLength();
      setQueueLength(count);
    } catch (error) {
      console.error('Error reading offline queue length:', error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let cancelled = false;

    const loadMappings = async (shouldToastCacheNotice = false) => {
      const cached = window.localStorage.getItem(MAPPINGS_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as MappingsCache;
          if (!cancelled) {
            setMappings(parsed);
          }
        } catch (error) {
          console.error('Failed to parse cached mappings:', error);
        }
      }

      const isOnline = typeof navigator === 'undefined' ? true : navigator.onLine;
      if (!isOnline) {
        if (!cancelled) {
          if (cached && shouldToastCacheNotice) {
            toast.info('Using saved fleet data while we reconnect.');
          } else if (!cached) {
            toast.error('Offline - fleet data unavailable until you reconnect.');
          }
        }
        return;
      }

      try {
        const fresh = await fetchMappings();
        if (!cancelled) {
          setMappings(fresh);
          window.localStorage.setItem(MAPPINGS_CACHE_KEY, JSON.stringify(fresh));
        }
      } catch (error) {
        console.error('Error fetching mappings:', error);
        if (!cached && !cancelled) {
          toast.error('Unable to load fleet data. Check your connection.');
        } else if (!cancelled) {
          toast.info('Showing saved fleet data. Some options may be outdated.');
        }
      }
    };
    
    const handleOnline = async () => {
      setIsOffline(false);
      await refreshQueueLength();
      await loadMappings();
      // Retry offline queue when coming back online
      try {
        const result = await retryQueue();
        if (result.success > 0) {
          toast.success(`${result.success} offline reports submitted successfully!`);
        }
        if (result.failed > 0) {
          toast.error(`${result.failed} reports failed to sync. Please check your submissions.`);
        }
      } catch (error) {
        console.error('Error retrying offline queue:', error);
      } finally {
        await refreshQueueLength();
      }
    };
    
    const handleOffline = async () => {
      setIsOffline(true);
      await refreshQueueLength();
      await loadMappings(true);
    };

    void loadMappings();
    void refreshQueueLength();
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOffline(!navigator.onLine);
    
  

  return () => {
    cancelled = true;
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, [refreshQueueLength]);



const driverName = watch('driverName');
const fleetNumber = watch('fleetNumber');
const primeRegoValue = watch('primeRego');

// Smart auto-fill logic - only auto-fill when fields are empty
useEffect(() => {
  if (!mappings) return;

  if (driverName && mappings.drivers[driverName]) {
    const driverData = mappings.drivers[driverName];
    const currentPhone = watch('driverPhone');
    if (driverData.phone && (!currentPhone || currentPhone.trim() === '')) {
      setValue('driverPhone', driverData.phone);
    }
  }

  if (fleetNumber && mappings.fleets[fleetNumber]) {
    const fleetData = mappings.fleets[fleetNumber];
    const currentRego = watch('primeRego');
    if (fleetData.rego && (!currentRego || currentRego.trim() === '')) {
      setValue('primeRego', fleetData.rego);
    }
  }
}, [fleetNumber, driverName, setValue, mappings, watch]);

const useGPS = () => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setValue('location', `GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        toast.success('Location captured');
      },
      () => {
        toast.error('Failed to get location');
      }
    );
  } else {
    toast.error('Geolocation not supported');
  }
};

const manualAutoFill = () => {
  if (!mappings) {
    toast.error('Data not loaded yet');
    return;
  }

  let filledCount = 0;

  if (driverName && mappings.drivers[driverName]) {
    const driverData = mappings.drivers[driverName];
    if (driverData.phone) {
      setValue('driverPhone', driverData.phone);
      filledCount++;
    }
  }

  if (fleetNumber && mappings.fleets[fleetNumber]) {
    const fleetData = mappings.fleets[fleetNumber];
    if (fleetData.rego) {
      setValue('primeRego', fleetData.rego);
      filledCount++;
    }
  }

  if (filledCount > 0) {
    toast.success(`Auto-filled ${filledCount} field${filledCount > 1 ? 's' : ''}`);
  } else {
    toast.info('No data available to auto-fill. Please select a fleet number or driver first.');
  }
};


const onSubmit = async (data: ReportForm) => {
  setLoading(true);
  let mediaUrls: string[] = [];

  try {
    // Save driver name for My Issues page
    if (data.driverName) {
      localStorage.setItem('last-driver-name', data.driverName);
    }

    if (files.length > 0) {
      const formData = new FormData();
      formData.append('issueId', 'temp');
      files.forEach((file) => formData.append('files', file));

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const { urls } = await uploadRes.json();
        mediaUrls = urls;
      }
    }

    const response = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, mediaUrls }),
    });

    if (!response.ok) {
      let errorMessage = 'Failed to submit report';
      try {
        const errorBody = await response.json();
        if (errorBody?.error) {
          errorMessage = errorBody.error;
        }
      } catch {
        // ignore body parse errors
      }

      if (response.status === 429) {
        throw new Error('Too many requests. Please wait a moment and try again.');
      }

      if (response.status === 503) {
        throw new Error(errorMessage);
      }

      throw new Error(errorMessage);
    }

    const { ticket } = await response.json();
    
    // Mark visit for PWA installer
    localStorage.setItem('visited-report', 'true');
    
    toast.success('Report submitted successfully!');
    router.push(`/thanks/${ticket}`);
  } catch (error) {
    if (isOffline || error instanceof TypeError) {
      try {
        const queueId = await queueIssue({ ...data, mediaUrls });
        toast.success('Report saved offline. Will submit when you reconnect.');
        console.log('Queued offline issue:', queueId);
        await refreshQueueLength();
      } catch (queueError) {
        console.error('Failed to save report offline:', queueError);
        toast.error('Failed to save report offline. Please try again.');
      }
    } else {
      toast.error(error instanceof Error ? error.message : 'Failed to submit report');
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Navigation />

      <main className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* Hero Header */}
        <header className="mb-10 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-blue-200/70 bg-gradient-to-r from-blue-50 to-blue-100 px-5 py-2 text-sm font-semibold tracking-wide text-blue-700 shadow-sm dark:border-blue-900/40 dark:from-blue-900/20 dark:to-blue-900/30 dark:text-blue-300">
            <Truck className="h-4 w-4" />
            Driver Report
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl dark:text-white">
              Report an Issue
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 dark:text-slate-300">
              Fill out the form below to report vehicle issues. Your submission will be instantly routed to the operations team.
            </p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="rounded-3xl border-2 border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-sm dark:border-slate-800/80 dark:bg-slate-900/80">
            <CardHeader className="space-y-6 border-b border-slate-200/70 p-8 pb-6 dark:border-slate-800">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-blue-600 dark:text-blue-400">{t.report.step1}</p>
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                    {translate('Issue Report Form')}
                  </h2>
                  <p className="text-base text-slate-600 dark:text-slate-400">
                    {translate('Fields marked with * are required for submission.')}
                  </p>
                </div>
                <div className="rounded-2xl border-2 border-slate-200/70 bg-gradient-to-br from-slate-50 to-slate-100 px-5 py-4 text-center shadow-sm dark:border-slate-800 dark:from-slate-900/60 dark:to-slate-900/80">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                    {translate('Offline queue')}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{queueLength}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{translate('Reports waiting to sync')}</p>
                </div>
              </div>

              <div
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${isOffline
                  ? 'border-amber-400/40 bg-amber-50/80 text-amber-700 dark:border-amber-500/30 dark:bg-amber-900/20 dark:text-amber-200'
                  : 'border-emerald-400/40 bg-emerald-50/80 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-900/20 dark:text-emerald-200'
                }`}
              >
                {isOffline ? (
                  <WifiOff className="mt-1 h-5 w-5 flex-shrink-0" />
                ) : (
                  <Wifi className="mt-1 h-5 w-5 flex-shrink-0" />
                )}
                <div className="space-y-1">
                  <p className="font-medium">
                    {isOffline ? translate('You are currently offline.') : translate('You are connected.')}
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {isOffline
                      ? translate('The report will stay queued on this device and auto-submit once the network is restored.')
                      : queueLength > 0
                        ? `${translate('Syncing')} ${queueLength} ${queueLength > 1 ? translate('pending offline reports') : translate('pending offline report')} ${translate('in the background.').trim()}`
                        : translate('Submissions will be processed instantly and routed to operations.')}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-8 pt-4">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Driver Info */}
                <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.report.driverInfo}</h3>
                    <span className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">{t.report.step1}</span>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="driverName">{t.report.driverName}</Label>
                      {drivers.length > 0 ? (
                        <Controller
                          control={control}
                          name="driverName"
                          render={({ field }) => (
                            <Select
                              value={field.value || undefined}
                              onValueChange={(value: string) => field.onChange(value)}
                            >
                              <SelectTrigger id="driverName">
                                <SelectValue placeholder={translate('Select driver')} />
                              </SelectTrigger>
                              <SelectContent>
                                {drivers.map((driver) => (
                                  <SelectItem key={driver} value={driver}>
                                    {driver}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      ) : (
                        <Input id="driverName" {...register('driverName')} placeholder="e.g. Alex Martin" />
                      )}
                      {errors.driverName && <p className="text-sm text-destructive">{errors.driverName.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driverPhone">{t.report.driverPhone}</Label>
                      <Input id="driverPhone" type="tel" {...register('driverPhone')} placeholder="+61 4xx xxx xxx" />
                    </div>
                  </div>
                </section>

                {/* Vehicle Info */}
                <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.report.vehicleId}</h3>
                    <span className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">{t.report.step2}</span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="fleetNumber">{t.report.truckRegistration}</Label>
                    {fleetNumbers.length > 0 ? (
                      <>
                        <Controller
                          control={control}
                          name="fleetNumber"
                          render={({ field }) => (
                            <Select
                              value={field.value || undefined}
                              onValueChange={(value: string) => {
                                field.onChange(value);
                                const rego = value ? mappings?.fleets[value]?.rego ?? '' : '';
                                setValue('primeRego', rego);
                              }}
                            >
                              <SelectTrigger id="fleetNumber">
                                <SelectValue placeholder={translate('Select truck registration')} />
                              </SelectTrigger>
                              <SelectContent>
                                {fleetNumbers.map((fleet) => {
                                  const rego = mappings?.fleets[fleet]?.rego;
                                  return (
                                    <SelectItem key={fleet} value={fleet}>
                                      <div className="flex flex-col items-start">
                                        <span className="text-sm font-semibold">
                                          {rego && rego.trim().length > 0 ? rego : fleet}
                                        </span>
                                        <span className="text-[0.7rem] uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                                          Fleet {fleet}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.fleetNumber && <p className="text-sm text-destructive">{errors.fleetNumber.message}</p>}
                        <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                          <p>
                            Fleet number:{' '}
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              {fleetNumber || 'Select a truck above'}
                            </span>
                          </p>
                          {primeRegoValue ? (
                            <p>
                              Registration:{' '}
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{primeRegoValue}</span>
                            </p>
                          ) : null}
                        </div>
                        <input type="hidden" {...register('primeRego')} />
                      </>
                    ) : (
                      <>
                        <Input id="fleetNumber" {...register('fleetNumber')} placeholder="e.g. 52A" />
                        {errors.fleetNumber && <p className="text-sm text-destructive">{errors.fleetNumber.message}</p>}
                        <div className="space-y-2">
                          <Label htmlFor="primeRego" className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            Registration
                          </Label>
                          <Input id="primeRego" {...register('primeRego')} placeholder="Registration number" />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="trailerA">Trailer A</Label>
                      {trailerAOptions.length > 0 ? (
                        <Controller
                          control={control}
                          name="trailerA"
                          render={({ field }) => (
                            <Select
                              value={field.value || undefined}
                              onValueChange={(value: string) => {
                                if (value === '__clear__') {
                                  field.onChange('');
                                } else {
                                  field.onChange(value);
                                }
                              }}
                            >
                              <SelectTrigger id="trailerA">
                                <SelectValue placeholder="Select trailer A" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__clear__">No trailer</SelectItem>
                                {trailerAOptions.map((trailer) => {
                                  const rego = mappings?.trailers?.[trailer]?.rego;
                                  return (
                                    <SelectItem key={trailer} value={trailer}>
                                      {rego ? `${trailer} (${rego})` : trailer}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      ) : (
                        <Input id="trailerA" {...register('trailerA')} placeholder="Trailer A identifier" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="trailerB">Trailer B</Label>
                      {trailerBOptions.length > 0 ? (
                        <Controller
                          control={control}
                          name="trailerB"
                          render={({ field }) => (
                            <Select
                              value={field.value || undefined}
                              onValueChange={(value: string) => {
                                if (value === '__clear__') {
                                  field.onChange('');
                                } else {
                                  field.onChange(value);
                                }
                              }}
                            >
                              <SelectTrigger id="trailerB">
                                <SelectValue placeholder="Select trailer B" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__clear__">No trailer</SelectItem>
                                {trailerBOptions.map((trailer) => {
                                  const rego = mappings?.trailers?.[trailer]?.rego;
                                  return (
                                    <SelectItem key={trailer} value={trailer}>
                                      {rego ? `${trailer} (${rego})` : trailer}
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      ) : (
                        <Input id="trailerB" {...register('trailerB')} placeholder="Trailer B identifier" />
                      )}
                    </div>
                  </div>
                </section>

                {/* Issue Details */}
                <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{t.report.issueSummary}</h3>
                    <span className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">{t.report.step3}</span>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category">{t.report.category}</Label>
                      <Select onValueChange={(value: string) => setValue('category', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Mechanical">Mechanical</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="Body">Body</SelectItem>
                          <SelectItem value="Tyres">Tyres</SelectItem>
                          <SelectItem value="Brakes">Brakes</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>{t.report.severity}</Label>
                      <RadioGroup defaultValue="MEDIUM" onValueChange={(value: string) => setValue('severity', value as ReportForm['severity'])}>
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="LOW" id="low" />
                            <Label htmlFor="low" className="font-normal">Low</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="MEDIUM" id="medium" />
                            <Label htmlFor="medium" className="font-normal">Medium</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="HIGH" id="high" />
                            <Label htmlFor="high" className="font-normal">High</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="CRITICAL" id="critical" />
                            <Label htmlFor="critical" className="font-normal">Critical</Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="description">{t.report.description}</Label>
                    <Textarea
                      id="description"
                      rows={4}
                      {...register('description')}
                      placeholder="Describe symptoms, sounds, warning lights, or other context that helps the workshop prioritise the repair..."
                    />
                    {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="location">Current location</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        id="location"
                        className="flex-1"
                        {...register('location')}
                        placeholder="Enter suburb, depot, or GPS coordinates"
                      />
                      <div className="flex gap-2">
                        <Button type="button" variant="outline" className="flex-1 gap-2" onClick={useGPS}>
                          <MapPin className="h-4 w-4" />
                          GPS
                        </Button>
                        <Button type="button" variant="outline" className="flex-1 gap-2" onClick={manualAutoFill}>
                          <RefreshCw className="h-4 w-4" />
                          Auto-fill
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Label>Safe to continue driving?</Label>
                    <RadioGroup defaultValue="Yes" onValueChange={(value: string) => setValue('safeToContinue', value)} className="flex flex-wrap gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Yes" id="safe-yes" />
                        <Label htmlFor="safe-yes" className="font-normal">Yes</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="No" id="safe-no" />
                        <Label htmlFor="safe-no" className="font-normal">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="Unsure" id="safe-unsure" />
                        <Label htmlFor="safe-unsure" className="font-normal">Unsure</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </section>

                {/* Media Upload */}
                <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Media evidence</h3>
                    <span className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Optional</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Upload photos or video clips that clarify the issue. Clear media helps operations triage faster.
                  </p>
                  <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/60">
                    <UploadZone onFilesChange={setFiles} />
                    <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <UploadCloud className="mt-0.5 h-4 w-4 text-blue-500 dark:text-blue-300" />
                      <span>Accepted formats: JPG, PNG, MP4 up to 50MB each.</span>
                    </div>
                  </div>
                </section>

                {/* Preferred Service Window */}
                <section className="rounded-2xl border border-slate-200/70 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Preferred service window</h3>
                    <span className="text-xs uppercase tracking-[0.35em] text-slate-400 dark:text-slate-500">Step 4 of 4</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Suggest a timeframe where the asset can be taken out of service. Operations will confirm availability.
                  </p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="preferredFrom">From</Label>
                      <Input id="preferredFrom" type="datetime-local" {...register('preferredFrom')} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="preferredTo">To</Label>
                      <Input id="preferredTo" type="datetime-local" {...register('preferredTo')} />
                    </div>
                  </div>
                </section>

                {/* Submit */}
                <div className="flex flex-col gap-3 rounded-2xl border border-blue-200/70 bg-blue-50/70 p-6 text-sm text-blue-900 shadow-sm dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-100">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em]">Review & submit</p>
                  <p>Once submitted, a ticket ID will be issued and the operations team will contact you if additional details are required.</p>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="mt-2 h-12 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t.report.submitReport}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Common issues</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Quick pointers drivers can check before submitting a ticket.
              </p>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-500 dark:text-amber-300" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Warning lights after start</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Confirm the park brake is engaged and perform a quick systems reset before logging.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <Wrench className="mt-0.5 h-4 w-4 text-blue-500 dark:text-blue-300" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Air leaks or low pressure</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Listen around glad hands and tanks, then capture the PSI reading in your description.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <Thermometer className="mt-0.5 h-4 w-4 text-rose-500 dark:text-rose-300" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Overheating or coolant alerts</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Note the current temp gauge position and check for visible leaks before switching off.
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href="/troubleshoot"
                className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 transition hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200"
              >
                Full troubleshoot guide
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900/80">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Submission checklist</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-blue-500 dark:text-blue-300" />
                  Confirm the fleet number and trailers so the workshop can plan parts and labour.
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-blue-500 dark:text-blue-300" />
                  Mention dashboard warnings, leaks, noises, or anything out of the ordinary.
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 text-blue-500 dark:text-blue-300" />
                  Attach photos when damage, wear, or alerts are visible - they speed up triage.
                </li>
              </ul>
            </div>

            <div id="support" className="rounded-3xl border border-blue-200/70 bg-blue-50/70 p-6 text-sm text-blue-900 shadow-lg dark:border-blue-900/40 dark:bg-blue-900/30 dark:text-blue-100">
              <h3 className="text-lg font-semibold">Need help?</h3>
              <p className="mt-2">
                Call the operations desk if the vehicle is unsafe or you need support completing the form.
              </p>
              <div className="mt-4 rounded-2xl border border-blue-200/70 bg-white/70 px-4 py-3 text-base font-semibold text-blue-900 dark:border-blue-900/50 dark:bg-slate-950/40 dark:text-blue-100">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  1300 555 732
                </div>
              </div>
              <p className="mt-4 text-xs text-blue-900/80 dark:text-blue-100/80">
                After working hours, contact the duty manager. Critical issues should be escalated immediately.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <QuickActionsMenu />
      <Footer className="mt-16" />
    </div>
  );
}

