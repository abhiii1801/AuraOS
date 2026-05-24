import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 'welcome', title: 'Welcome to AuraOS' },
  { id: 'health', title: 'Health & Fitness Goals' },
  { id: 'finance', title: 'Financial Preferences' },
  { id: 'complete', title: 'Setup Complete' }
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    fitness_goals: {
      steps: 10000,
      calories: 2500,
      distance: 5,
      active_minutes: 60,
      sleep_hours: 8
    },
    budget_allocation: 5000,
    initial_balance: 10000,
    finance_categories: ['Groceries', 'Rent', 'Utilities', 'Entertainment', 'Transport']
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitData();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitData = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        navigate('/dashboard'); // or /overview depending on your app
      } else {
        console.error('Failed to submit onboarding data');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFitness = (field, value) => {
    setFormData(prev => ({
      ...prev,
      fitness_goals: { ...prev.fitness_goals, [field]: Number(value) }
    }));
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, idx) => (
            <div key={step.id} className={`text-sm ${idx <= currentStep ? 'text-indigo-400' : 'text-gray-600'}`}>
              {step.title}
            </div>
          ))}
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 0: Welcome */}
            {currentStep === 0 && (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-indigo-500/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                  <i className="fa-solid fa-sparkles"></i>
                </div>
                <h1 className="text-4xl font-light tracking-tight">Welcome to AuraOS</h1>
                <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
                  Before we launch your personal dashboard, let's configure your baseline preferences so AuraOS can provide personalized insights.
                </p>
              </div>
            )}

            {/* Step 1: Health & Fitness */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
                    <i className="fa-solid fa-heart-pulse text-sm"></i>
                  </div>
                  Daily Fitness Targets
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Daily Steps</label>
                    <input type="number" value={formData.fitness_goals.steps} onChange={e => updateFitness('steps', e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Calories Burned (kcal)</label>
                    <input type="number" value={formData.fitness_goals.calories} onChange={e => updateFitness('calories', e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Distance (km)</label>
                    <input type="number" value={formData.fitness_goals.distance} onChange={e => updateFitness('distance', e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Sleep (Hours)</label>
                    <input type="number" value={formData.fitness_goals.sleep_hours} onChange={e => updateFitness('sleep_hours', e.target.value)}
                      className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Finance */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-light mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <i className="fa-solid fa-wallet text-sm"></i>
                  </div>
                  Financial Baseline
                </h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Initial Account Balance</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500">$</span>
                      <input type="number" value={formData.initial_balance} onChange={e => setFormData({...formData, initial_balance: Number(e.target.value)})}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Monthly Budget Target</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-gray-500">$</span>
                      <input type="number" value={formData.budget_allocation} onChange={e => setFormData({...formData, budget_allocation: Number(e.target.value)})}
                        className="w-full bg-gray-950 border border-gray-800 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:border-indigo-500 transition-colors" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 pt-2">
                    <label className="text-sm text-gray-400">Primary Spend Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.finance_categories.map((cat, i) => (
                        <div key={i} className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-sm text-gray-300">
                          {cat}
                        </div>
                      ))}
                      <button className="px-3 py-1 border border-dashed border-gray-600 rounded-full text-sm text-gray-400 hover:text-white hover:border-gray-400 transition-colors">
                        + Add Category
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Complete */}
            {currentStep === 3 && (
              <div className="text-center space-y-6 py-8">
                <div className="w-20 h-20 bg-indigo-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-[0_0_40px_rgba(99,102,241,0.4)]">
                  <i className="fa-solid fa-check"></i>
                </div>
                <h2 className="text-3xl font-light">All Set!</h2>
                <p className="text-gray-400 text-lg max-w-sm mx-auto">
                  Your baseline preferences have been saved. AuraOS is generating your personalized dashboard...
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Footer */}
        <div className="mt-10 flex justify-between items-center border-t border-gray-800 pt-6">
          <button 
            onClick={handleBack}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${currentStep === 0 ? 'opacity-0 pointer-events-none' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            Back
          </button>
          
          <button 
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] flex items-center gap-2"
          >
            {isSubmitting ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</>
            ) : currentStep === steps.length - 1 ? (
              'Enter Workspace'
            ) : (
              <>Continue <i className="fa-solid fa-arrow-right text-sm"></i></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
