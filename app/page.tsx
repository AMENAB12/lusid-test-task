"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import FormulaInput from '@/components/FormulaInput';
import { CalculatorIcon, InfoIcon, SparklesIcon, ZapIcon, TableIcon, EditIcon } from 'lucide-react';

const queryClient = new QueryClient();

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="p-3 bg-blue-100 rounded-full">
                  <CalculatorIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Formula Calculator
                </h1>
              </div>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Create and calculate complex formulas with an intuitive interface.
                Switch between formula and table views for better organization.
              </p>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Formula Input Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <SparklesIcon className="w-5 h-5 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">Create Your Formula</h2>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100">
                    <FormulaInput />
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 h-full">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <InfoIcon className="w-5 h-5 text-purple-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800">Features</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
                      <div className="flex items-center gap-3 mb-2">
                        <ZapIcon className="w-4 h-4 text-blue-500" />
                        <h3 className="font-medium text-blue-800">Smart Autocomplete</h3>
                      </div>
                      <p className="text-sm text-blue-600">Get intelligent suggestions as you type variable names</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border border-purple-100">
                      <div className="flex items-center gap-3 mb-2">
                        <TableIcon className="w-4 h-4 text-purple-500" />
                        <h3 className="font-medium text-purple-800">Multiple Views</h3>
                      </div>
                      <p className="text-sm text-purple-600">Switch between formula and table views for better organization</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border border-green-100">
                      <div className="flex items-center gap-3 mb-2">
                        <CalculatorIcon className="w-4 h-4 text-green-500" />
                        <h3 className="font-medium text-green-800">Real-time Calculation</h3>
                      </div>
                      <p className="text-sm text-green-600">Get instant results as you build your formula</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-50 to-white rounded-xl border border-orange-100">
                      <div className="flex items-center gap-3 mb-2">
                        <EditIcon className="w-4 h-4 text-orange-500" />
                        <h3 className="font-medium text-orange-800">Easy Editing</h3>
                      </div>
                      <p className="text-sm text-orange-600">Click any variable to edit or replace it</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mt-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <SparklesIcon className="w-5 h-5 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Quick Tips</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-lg">1</div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Type Variables</h3>
                    <p className="text-sm text-gray-600">Start typing to see autocomplete suggestions</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 font-semibold text-lg">2</div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Use Operators</h3>
                    <p className="text-sm text-gray-600">+, -, *, /, ^, (, ) for calculations</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600 font-semibold text-lg">3</div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Edit Variables</h3>
                    <p className="text-sm text-gray-600">Click on any variable to edit or replace it</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-lg">4</div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Delete Variables</h3>
                    <p className="text-sm text-gray-600">Use backspace to remove variables</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-pink-100 flex items-center justify-center text-pink-600 font-semibold text-lg">5</div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Calculate Result</h3>
                    <p className="text-sm text-gray-600">Press = or Enter to calculate</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold text-lg">6</div>
                  <div>
                    <h3 className="font-medium text-gray-800 mb-1">Table View</h3>
                    <p className="text-sm text-gray-600">Switch to table view for better organization</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </QueryClientProvider>
  );
}