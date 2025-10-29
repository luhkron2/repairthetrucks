'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/ui/logo';
import { Wrench, Settings, Shield, Home, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const ACCESS_LEVELS = {
  operations: {
    name: 'Operations',
    description: 'Manage operations and view all reports',
    icon: Settings,
    password: 'ops123',
    redirect: '/operations',
    highlights: [
      'Monitor and triage new incident reports in real time',
      'Assign workshop actions and track fleet availability',
      'Export compliance-ready summaries for leadership'
    ]
  },
  workshop: {
    name: 'Workshop',
    description: 'Manage repairs and workshop operations',
    icon: Wrench,
    password: 'workshop123',
    redirect: '/workshop',
    highlights: [
      'See the live repair queue with priority indicators',
      'Update job progress and attach completion notes',
      'Coordinate with operations for parts and scheduling'
    ]
  }
};

export default function AccessPage() {
  const [selectedAccess, setSelectedAccess] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccessSelect = (accessType: string) => {
    setSelectedAccess(accessType);
    setPassword('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccess) return;

    setLoading(true);

    // Immediate password check
    const accessConfig = ACCESS_LEVELS[selectedAccess as keyof typeof ACCESS_LEVELS];
    
    if (password === accessConfig.password) {
      // Store access level in session storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('accessLevel', selectedAccess);
        sessionStorage.setItem('isAuthenticated', 'true');
      }
      
      toast.success(`Welcome to ${accessConfig.name}!`);
      // Use window.location for immediate redirect
      window.location.href = accessConfig.redirect;
    } else {
      toast.error('Invalid password. Please try again.');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-2xl border border-blue-100/60 bg-white/95 shadow-lg dark:border-blue-900/40 dark:bg-gray-950/70">
          <CardHeader className="text-center">
            <p className="uppercase tracking-[0.35em] text-[0.65rem] text-blue-600 dark:text-blue-300">
              Step 2
            </p>
            <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
              <IconComponent className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl">{accessConfig.name} Access</CardTitle>
            <p className="text-muted-foreground">{accessConfig.description}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground">
              For security, this area is limited to SE Repairs staff. Enter the latest passphrase to continue.
            </p>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Enter Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Verifying...' : 'Access'}
                </Button>
              </div>
            </form>
            <div className="rounded-xl border border-blue-100/80 bg-blue-50/60 p-4 text-left text-xs text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/10 dark:text-blue-100">
              <p className="font-medium">Tip</p>
              <p>Passwords rotate regularly. If you need the latest passphrase, contact operations leadership.</p>
            </div>
            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/" className="inline-flex justify-center">
                <Button variant="ghost" className="gap-2">
                  <Home className="h-4 w-4" />
                  Return Home
                </Button>
              </Link>
              <p>
                Need access? Email{' '}
                <a
                  href="mailto:support@se-repairs.com"
                  className="font-medium text-blue-600 underline underline-offset-4 dark:text-blue-300"
                >
                  support@se-repairs.com
                </a>
                .
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <Logo size="xl" />
          <p className="uppercase tracking-[0.35em] text-xs text-blue-600 dark:text-blue-300 mt-6">
            Step 1
          </p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mt-6 mb-4">
            SE Repairs System
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Choose your access level to continue
          </p>
          <div className="mt-6 flex justify-center">
            <Link href="/" className="inline-flex">
              <Button variant="ghost" className="gap-2">
                <Home className="h-4 w-4" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {Object.entries(ACCESS_LEVELS).map(([key, config]) => {
            const IconComponent = config.icon;
            return (
              <Card
                key={key}
                className="group h-full cursor-pointer overflow-hidden rounded-2xl border border-transparent bg-white/95 shadow-md transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl dark:bg-gray-900/60"
                onClick={() => handleAccessSelect(key)}
              >
                <CardHeader className="space-y-3 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 text-blue-600 dark:from-blue-900/40 dark:via-blue-900/20 dark:to-blue-900/50">
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {config.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {config.description}
                  </p>
                </CardHeader>
                <CardContent className="flex h-full flex-col justify-between gap-6 px-6 pb-6 text-left">
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    {config.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 text-blue-500 dark:text-blue-400" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-2">
                    <Button className="w-full justify-center gap-2 text-base">
                      <Shield className="h-4 w-4" />
                      Access {config.name}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 rounded-2xl border border-blue-100/60 bg-blue-50/60 p-6 text-center text-sm text-blue-900 dark:border-blue-900/40 dark:bg-blue-900/10 dark:text-blue-100">
          Need access or forgot your password? Email{' '}
          <a
            href="mailto:support@se-repairs.com"
            className="font-semibold underline underline-offset-4"
          >
            support@se-repairs.com
          </a>{' '}
          for help.
        </div>
      </div>
    </div>
  );
}
