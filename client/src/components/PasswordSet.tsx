

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, Check, X, AlertTriangle } from 'lucide-react';

const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain at least one special character'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

interface PasswordSetProps {
  sessionId: string;
  onPasswordSet: () => void;
}

export default function PasswordSet({ sessionId, onPasswordSet }: PasswordSetProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  const getPasswordRequirements = (password: string) => {
    return [
      { text: 'At least 8 characters', met: password.length >= 8 },
      { text: 'One lowercase letter', met: /[a-z]/.test(password) },
      { text: 'One uppercase letter', met: /[A-Z]/.test(password) },
      { text: 'One number', met: /[0-9]/.test(password) },
      { text: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
    ];
  };

  const onSubmit = async (values: any) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting password with sessionId:', sessionId);
      const response = await apiRequest("POST", `/api/set-password`, {
        sessionId,
        password: values.password
      });
      
      if (response.ok) {
        toast({
          title: 'Password Set Successfully!',
          description: 'Your account is now secure with a strong password.',
        });
        onPasswordSet();
      } else {
        const errorData = await response.json();
        console.error('Password setting error:', errorData);
        toast({
          title: 'Failed to Set Password',
          description: errorData.error || 'An unexpected error occurred. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Password submission error:', error);
      toast({
        title: 'Network Error',
        description: 'Unable to connect to server. Please check your connection and try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentPassword = form.watch('password');
  const requirements = getPasswordRequirements(currentPassword || '');
  const strength = calculatePasswordStrength(currentPassword || '');

  const getStrengthColor = () => {
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Create a Secure Password</h3>
        <p className="text-sm text-gray-600">
          Your password will be used to access your account and bot configurations.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Enter your secure password"
                      onChange={(e) => {
                        field.onChange(e);
                        setPasswordStrength(calculatePasswordStrength(e.target.value));
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {currentPassword && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Password Strength:</span>
                <span className={`font-medium ${strength < 40 ? 'text-red-600' : strength < 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                  {getStrengthText()}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                  style={{ width: `${strength}%` }}
                ></div>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      {...field} 
                      type={showConfirmPassword ? "text" : "password"} 
                      placeholder="Confirm your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {currentPassword && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Password Requirements:</h4>
              <div className="space-y-1">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    {req.met ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <X className="h-4 w-4 text-red-500" />
                    )}
                    <span className={req.met ? 'text-green-700' : 'text-red-600'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Security Tips:</strong>
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Use a unique password you don't use elsewhere</li>
                <li>Consider using a password manager</li>
                <li>Never share your password with anyone</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button 
            type="submit" 
            disabled={isSubmitting || strength < 70} 
            className="w-full"
          >
            {isSubmitting ? 'Setting Password...' : 'Set Password & Continue'}
          </Button>
        </form>
      </Form>
    </div>
  );
}

