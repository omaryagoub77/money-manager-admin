import React from 'react';
import DepositList from '../components/DepositList';
import Layout from '../components/Layout';

const DepositsPage = () => {
  return (
    <Layout>
      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">CashO out Management</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <DepositList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
};

export default DepositsPage;