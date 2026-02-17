import { useState } from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { SignupForm } from '../components/auth/SignupForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { Store } from 'lucide-react';

type FormType = 'login' | 'signup' | 'reset';

export function AuthPage() {
  const [currentForm, setCurrentForm] = useState<FormType>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start mb-6">
            <div className="bg-blue-600 p-4 rounded-xl">
              <Store className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Modern POS System
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Manage your retail business with our cloud-based Point of Sale solution
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg mt-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Real-time Inventory</h3>
                <p className="text-gray-600">Track stock levels automatically with every sale</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg mt-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Multi-device Access</h3>
                <p className="text-gray-600">Access from any device, anywhere</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg mt-1">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">14-Day Free Trial</h3>
                <p className="text-gray-600">No credit card required to get started</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full max-w-md">
          {currentForm === 'login' && <LoginForm onToggleForm={setCurrentForm} />}
          {currentForm === 'signup' && <SignupForm onToggleForm={setCurrentForm} />}
          {currentForm === 'reset' && <ResetPasswordForm onToggleForm={setCurrentForm} />}
        </div>
      </div>
    </div>
  );
}
