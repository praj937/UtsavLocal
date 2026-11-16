import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center bg-slate-50 px-4 py-16">
      <div className="max-w-md w-full text-center space-y-4">
        <div className="text-6xl font-black text-terracotta-600">404</div>
        <h2 className="text-2xl font-bold text-slate-900">
          Neighborhood Lane Not Found
        </h2>
        <p className="text-sm text-slate-500 leading-relaxed">
          Looks like you wandered off the map! The festival or page you're searching for might have moved or ended.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-sm shadow-sm transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Return to Event Feed</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
