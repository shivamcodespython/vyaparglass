'use client';

import React from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import { Star, ShieldCheck, CheckCircle2, Award, ThumbsUp, MessageSquare } from 'lucide-react';

export function ReviewsView() {
  const { myBusiness } = useBizLink();

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
            <h3 className="text-base font-bold text-slate-900">
              Verified Reputation & Trust Metrics
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent ratings combining SerpApi external Google reviews and verified BizLink B2B trade feedback
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-800">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>{myBusiness.rating.toFixed(1)} Aggregate Score</span>
          <span className="text-slate-400 font-normal">({myBusiness.reviewCount} reviews)</span>
        </div>
      </div>

      {/* Trust Score Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">GST & Identity Verification</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono">100% Verified</div>
          <p className="text-[11px] text-slate-500">Active GSTIN: {myBusiness.gstNumber}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Order Fulfillment Accuracy</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{myBusiness.fulfillmentRate}%</div>
          <p className="text-[11px] text-slate-500">Based on past 142 dispatch cycles</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Trade Credit Score</span>
            <ThumbsUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-indigo-600">{myBusiness.trustScore} / 100</div>
          <p className="text-[11px] text-slate-500">Zero default records across trade partners</p>
        </div>
      </div>

      {/* Reviews Feed */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle space-y-4">
        <h4 className="text-sm font-bold text-slate-900">Trade Client Feedback</h4>

        <div className="space-y-3">
          {myBusiness.reviews.map(rev => (
            <div
              key={rev.id}
              className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-xs font-bold text-slate-900">{rev.authorName}</strong>
                    {rev.authorBusiness && (
                      <span className="text-xs text-slate-500">({rev.authorBusiness})</span>
                    )}
                    {rev.isVerifiedBuyer && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified Trade Buyer
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400">{rev.date}</span>
                </div>

                <div className="flex items-center gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    />
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-700 italic">"{rev.comment}"</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
