'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Settings, Truck, CheckCircle2, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const ACCESS_LEVELS = {
  driver: {
    name: 'Driver',
    description: 'Report vehicle issues and track repairs',
    icon: Truck,
    password: null, // No password needed for drivers
    redirect: '/report',
    color: 'from-blue-500 to-blue-600',
    highlights: [
      'Quick photo capture for issue reporting',
      'Track your submitted repair tickets in real-time',
      'Offline support with automatic sync when back online'
    ]
  },
  operations: {
    name: 'Operations',
    description: 'Manage operations and view all reports',
    icon: Settings,
    password: '1234',
    redirect: '/operations',
    color: 'from-purple-500 to-purple-600',
    highlights: [
      'Monitor and triage new incident reports in real-time',
      'Assign workshop actions and track fleet availability',
      'Export compliance-ready summaries for leadership'
    ]
  },
  workshop: {
    name: 'Workshop',
    description: 'Manage repairs and workshop operations',
    icon: Wrench,
    password: '5678',
    redirect: '/workshop',
    color: 'from-orange-500 to-orange-600',
    highlights: [
      'See the live repair queue with priority indicators',
      'Update job progress and attach completion notes',
      'Coordinate with operations for parts and scheduling'
    ]
  }
};

export default function HomePage() {
  const router = useRouter();
  const [selectedAccess, setSelectedAccess] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAccessSelect = (accessType: string) => {
    const accessConfig = ACCESS_LEVELS[accessType as keyof typeof ACCESS_LEVELS];
    
    // If driver access (no password required), authenticate and redirect immediately
    if (!accessConfig.password) {
      router.push(accessConfig.redirect);
      return;
    }
    
    // Otherwise, show password prompt
    setSelectedAccess(accessType);
    setPassword('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccess) return;

    setLoading(true);

    // Get the correct password for this access type
    const accessConfig = ACCESS_LEVELS[selectedAccess as keyof typeof ACCESS_LEVELS];
    
    // Simple string comparison for demo PINs
    if (password === accessConfig.password) {
      // Authenticate with NextAuth using demo credentials
      try {
        const email = selectedAccess === 'operations' ? 'ops@example.com' : 'workshop@example.com';
        const result = await signIn('credentials', {
          email,
          password: 'password123',
          redirect: false,
        });

        if (result?.error) {
          toast.error('Authentication failed');
          setLoading(false);
          return;
        }
        
        toast.success(`Welcome to ${accessConfig.name}!`);
        router.push(accessConfig.redirect);
        router.refresh();
      } catch {
        toast.error('Failed to authenticate');
        setLoading(false);
      }
    } else {
      toast.error('Invalid PIN. Please try again.');
      setPassword('');
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSelectedAccess(null);
    setPassword('');
  };

  if (selectedAccess) {
    const accessConfig = ACCESS_LEVELS[selectedAccess as keyof typeof ACCESS_LEVELS];
    const IconComponent = accessConfig.icon;

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl border-2 border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl backdrop-blur-sm">
          <CardHeader className="text-center space-y-4 pb-6">
            <div className="flex justify-center">
              <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${accessConfig.color} flex items-center justify-center shadow-lg`}>
                <IconComponent className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="uppercase tracking-[0.35em] text-[0.65rem] text-blue-300 font-semibold">
                Authentication Required
              </p>
              <CardTitle className="text-2xl font-bold text-white">{accessConfig.name} Access</CardTitle>
              <CardDescription className="text-base text-blue-200">{accessConfig.description}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-blue-900/40 border border-blue-700/50">
              <p className="text-sm text-blue-100">
                Enter your 4-digit PIN to access the system.
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-base font-semibold text-white">Enter PIN</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    className="pr-10 h-12 text-base bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400 text-center tracking-widest font-mono text-xl"
                    maxLength={4}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row pt-2">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1 h-12 border-slate-600 bg-slate-800/50 text-white hover:bg-slate-700">
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                  {loading ? 'Verifying...' : 'Access Dashboard'}
                </Button>
              </div>
            </form>
            <div className="rounded-xl border border-blue-700/50 bg-blue-900/20 p-4 text-left">
              <p className="font-semibold text-sm text-blue-200 mb-1">📋 Demo PINs</p>
              <p className="text-xs text-blue-100/90">Operations: 1234 | Workshop: 5678</p>
            </div>
            <div className="text-center text-sm text-slate-300">
              <p>
                Need access? Email{' '}
                <a
                  href="mailto:workshop%40senational.com.au"
                  className="font-semibold text-blue-300 underline underline-offset-4 hover:text-blue-200"
                >
                  workshop@senational.com.au
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-purple-900 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12 space-y-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl">
              <Wrench className="h-8 w-8 text-white" />
            </div>
            <span className="text-4xl font-bold tracking-tight text-white">
              SE Repairs
            </span>
          </div>
          <div className="space-y-3">
            <p className="uppercase tracking-[0.35em] text-xs text-blue-300 font-semibold">
              Access Selection
            </p>
            <p className="text-2xl text-slate-200">
              Enter your PIN to access the system
            </p>
            <div className="bg-blue-800/30 rounded-lg p-3 border border-blue-700/50">
              <p className="text-sm text-blue-200">
                Staff PINs: <span className="font-mono bg-blue-900/50 px-2 py-1 rounded">1234</span> (Ops) <span className="font-mono bg-blue-900/50 px-2 py-1 rounded">5678</span> (Workshop)
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {Object.entries(ACCESS_LEVELS).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <Card
                key={key}
                className="group relative h-full cursor-pointer overflow-hidden rounded-3xl border-2 border-slate-700/50 bg-gradient-to-br from-slate-800 to-slate-900 shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:border-blue-400 hover:shadow-blue-500/20 backdrop-blur-sm"
                onClick={() => handleAccessSelect(key)}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 blur-2xl transition-opacity group-hover:opacity-20" 
                     style={{ background: `linear-gradient(to bottom right, ${config.color.split(' ')[1]}, ${config.color.split(' ')[3]})` }} />
                <CardHeader className="space-y-4 text-center relative z-10">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110 group-hover:shadow-xl"
                       style={{ background: `linear-gradient(to bottom right, ${config.color.split(' ')[1]}, ${config.color.split(' ')[3]})` }}>
                    <IconComponent className="h-10 w-10 text-white" />
                  </div>
                  <div className="space-y-2">
                    <CardTitle className="text-2xl font-bold text-white">
                      {config.name}
                    </CardTitle>
                    <CardDescription className="text-base text-blue-200">
                      {config.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6 px-6 pb-6">
                  <ul className="space-y-3 text-sm">
                    {config.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-200">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-400" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full justify-center gap-2 text-base h-12 bg-gradient-to-r shadow-md transition-all group-hover:shadow-lg"
                    style={{ background: `linear-gradient(to right, ${config.color.split(' ')[1]}, ${config.color.split(' ')[3]})` }}
                  >
                    {config.password ? (
                      <>
                        <Shield className="h-5 w-5" />
                        Access {config.name}
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-5 w-5" />
                        Enter {config.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="rounded-3xl border-2 border-blue-800/50 bg-gradient-to-r from-blue-900/80 to-purple-900/80 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-blue-100">
              Need access or forgot your password? Email{' '}
              <a
                href="mailto:workshop%40senational.com.au"
                className="font-semibold text-blue-300 underline underline-offset-4 hover:text-blue-200 transition-colors"
              >
                workshop@senational.com.au
              </a>{' '}
              for help.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
