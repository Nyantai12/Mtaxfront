"use client";

import { Suspense } from "react";
import TeacherReviewsClient from "./TeacherReviewsClient";

export default function TeacherReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Тайлан хянах</h1>
            </div>
          </div>
        </header>
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    }>
      <TeacherReviewsClient />
    </Suspense>
  );
}