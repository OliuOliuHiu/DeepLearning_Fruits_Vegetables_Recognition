import React from 'react';
import { GithubIcon, LinkedinIcon, MailIcon } from 'lucide-react';
export function Footer() {
  return <footer className="mt-16 pb-8 text-center">
      <div className="bg-white rounded-2xl shadow-lg p-6 inline-block">
        <p className="text-gray-700 font-medium mb-4">
          Developed by{' '}
          <span className="font-bold text-green-600">[Your Name]</span>
        </p>
        <div className="flex items-center justify-center gap-4">
          <a href="#" className="bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-full hover:from-green-100 hover:to-green-200 transition-all transform hover:scale-110">
            <GithubIcon className="w-5 h-5 text-gray-700" />
          </a>
          <a href="#" className="bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-full hover:from-green-100 hover:to-green-200 transition-all transform hover:scale-110">
            <LinkedinIcon className="w-5 h-5 text-gray-700" />
          </a>
          <a href="#" className="bg-gradient-to-br from-gray-100 to-gray-200 p-3 rounded-full hover:from-green-100 hover:to-green-200 transition-all transform hover:scale-110">
            <MailIcon className="w-5 h-5 text-gray-700" />
          </a>
        </div>
      </div>
    </footer>;
}