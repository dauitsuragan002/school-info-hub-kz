
import React from 'react';
import Layout from '@/components/layout/Layout';
import LoginForm from '@/components/auth/LoginForm';

const LoginPage = () => {
  return (
    <Layout>
      <div className="flex items-center justify-center py-8">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
