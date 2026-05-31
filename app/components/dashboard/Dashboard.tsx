'use client';

import React from 'react';

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Main Content Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Main Tasks/Calendar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Welcome Section */}
          <div className="pro-card-gradient p-6">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome back! 👋</h1>
            <p className="text-white/60">Phase 2b: Implement dashboard components and wire to API</p>
          </div>

          {/* Tasks Section */}
          <div className="pro-card-gradient p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">📋 Your Tasks</h2>
            <p className="text-white/60">TODO: TaskCard components will be rendered here</p>
            <div className="mt-4 space-y-2">
              <div className="h-12 bg-white/5 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-white/5 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-white/5 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Calendar Section */}
          <div className="pro-card-gradient p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">📅 Calendar</h2>
            <p className="text-white/60">TODO: CalendarWidget will be rendered here</p>
            <div className="mt-4 h-64 bg-white/5 rounded-lg"></div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="pro-card-gradient p-4">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Today's Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-white/70">Tasks Due</span>
                <span className="text-2xl font-bold text-blue-400">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Meetings</span>
                <span className="text-2xl font-bold text-purple-400">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/70">Notes</span>
                <span className="text-2xl font-bold text-yellow-400">0</span>
              </div>
            </div>
          </div>

          {/* Notes Widget */}
          <div className="pro-card-gradient p-6">
            <h3 className="text-lg font-semibold text-white mb-4">📝 Recent Notes</h3>
            <p className="text-white/60 text-sm">TODO: NotesWidget will be rendered here</p>
            <div className="mt-4 space-y-2">
              <div className="h-10 bg-white/5 rounded-lg animate-pulse"></div>
              <div className="h-10 bg-white/5 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Chat Widget */}
          <div className="pro-card-gradient p-6">
            <h3 className="text-lg font-semibold text-white mb-4">💬 Team Chat</h3>
            <p className="text-white/60 text-sm">TODO: ChatPanel will be rendered here</p>
            <div className="mt-4 h-40 bg-white/5 rounded-lg flex items-center justify-center">
              <span className="text-white/40">Chat coming soon...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
