
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';

const passwordSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
});

export default function PasswordSet({ sessionId, onPasswordSet }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: ''
    }
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const response = await apiRequest("POST", `/api/set-password`, {
        sessionId,
        password: values.password
      });
      if (response.ok) {
        toast({
          title: 'Password Set!',
          description: 'Your password has been set successfully.'
        });
        onPasswordSet();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Submission failed',
        description: 'An error occurred while setting the password.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="password-set">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input {...field} type="password" placeholder="Enter your secure password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Setting Password...' : 'Set Password'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
