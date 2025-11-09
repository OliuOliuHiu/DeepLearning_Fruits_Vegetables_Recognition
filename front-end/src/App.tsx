import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { FruitInfoPage } from './pages/FruitInfoPage';
import { PredictionHistoryPage } from './pages/PredictionHistoryPage';
import { BatchUploadPage } from './pages/BatchUploadPage';
import { SettingsPage } from './pages/SettingsPage';
import { DashboardPage } from './pages/DashboardPage';
export interface PredictionResult {
  id: string;
  fruitName: string;
  confidence: number;
  imageUrl: string;
  timestamp: Date;
  nutritionalFacts: {
    calories: number;
    carbs: string;
    sugar: string;
    vitaminC: string;
    fiber: string;
  };
  priceEstimation: {
    perKg: number;
    perFruit: number;
    currency: string;
  };
  similarFruits: string[];
  funFact: string;
  category: string;
}
export function App() {
  return <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/fruit-info" element={<FruitInfoPage />} />
        <Route path="/history" element={<PredictionHistoryPage />} />
        <Route path="/batch" element={<BatchUploadPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </Layout>;
}