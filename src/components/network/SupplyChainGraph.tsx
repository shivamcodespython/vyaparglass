'use client';

import React, { useState, useMemo } from 'react';
import { useBizLink } from '@/context/BizLinkContext';
import { Business, BusinessRole, SupplyRelationship } from '@/types';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  ShieldCheck,
  Star,
  ArrowDown,
  Info,
  Building2,
  ExternalLink,
  PlusCircle,
} from 'lucide-react';

interface GraphNode {
  id: string;
  business: Business;
  tier: number; // 0: Manufacturer, 1: Super Wholesaler, 2: Wholesaler, 3: My Business, 4: Downstream Retailers, 5: Customers
  x: number;
  y: number;
  isMyBusiness: boolean;
}

export function SupplyChainGraph() {
  const {
    myBusiness,
    businesses,
    relationships,
    setInspectingBusiness,
    setDashboardView,
  } = useBizLink();

  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | 'upstream' | 'downstream'>('all');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<Business | null>(myBusiness);

  // Group and arrange businesses by supply tier
  const { nodes, links, tiers } = useMemo(() => {
    const businessMap = new Map<string, Business>(businesses.map(b => [b.id, b]));
    
    // Determine tier for each connected business
    const getTier = (b: Business): number => {
      if (b.id === myBusiness.id) return 3; // Center
      if (b.roles.includes('Manufacturer')) return 0;
      if (b.roles.includes('Super Wholesaler')) return 1;
      if (b.roles.includes('Wholesaler') || b.roles.includes('Distributor')) return 2;
      if (b.roles.includes('Retailer') || b.roles.includes('Service Provider')) return 4;
      return 5;
    };

    // Collect all active nodes
    const activeNodeIds = new Set<string>();
    activeNodeIds.add(myBusiness.id);

    relationships.forEach(rel => {
      activeNodeIds.add(rel.sourceId);
      activeNodeIds.add(rel.targetId);
    });

    // Also include any discovered businesses in the directory
    businesses.forEach(b => {
      if (b.id.startsWith('biz_ambala_led_hub') || b.id.startsWith('biz_haryana_lighting_corp')) {
        activeNodeIds.add(b.id);
      }
    });

    // Group businesses by tier
    const tierBuckets: Record<number, Business[]> = {
      0: [],
      1: [],
      2: [],
      3: [myBusiness],
      4: [],
      5: [],
    };

    activeNodeIds.forEach(id => {
      const b = businessMap.get(id);
      if (!b || b.id === myBusiness.id) return;
      const t = getTier(b);
      tierBuckets[t].push(b);
    });

    // Compute coordinates
    const graphNodes: GraphNode[] = [];
    const tierHeights = [80, 220, 370, 530, 690, 820];
    const width = 960;

    Object.entries(tierBuckets).forEach(([tierStr, bizList]) => {
      const tierNum = Number(tierStr);
      const y = tierHeights[tierNum] || 400;
      const count = bizList.length;

      bizList.forEach((biz, index) => {
        // Space nodes horizontally
        let x = width / 2;
        if (count > 1) {
          const spacing = Math.min(260, (width - 160) / (count - 1));
          const startX = (width - (count - 1) * spacing) / 2;
          x = startX + index * spacing;
        }

        graphNodes.push({
          id: biz.id,
          business: biz,
          tier: tierNum,
          x,
          y,
          isMyBusiness: biz.id === myBusiness.id,
        });
      });
    });

    // Build connections
    const graphLinks: Array<{
      id: string;
      source: GraphNode;
      target: GraphNode;
      label: string;
      status: string;
      isHighlighted: boolean;
    }> = [];

    const nodeCoordMap = new Map(graphNodes.map(n => [n.id, n]));

    relationships.forEach(rel => {
      const sourceNode = nodeCoordMap.get(rel.sourceId);
      const targetNode = nodeCoordMap.get(rel.targetId);

      if (sourceNode && targetNode) {
        graphLinks.push({
          id: rel.id,
          source: sourceNode,
          target: targetNode,
          label: rel.volumeMonthly,
          status: rel.status,
          isHighlighted:
            hoveredNodeId === rel.sourceId ||
            hoveredNodeId === rel.targetId ||
            sourceNode.isMyBusiness ||
            targetNode.isMyBusiness,
        });
      }
    });

    return {
      nodes: graphNodes,
      links: graphLinks,
      tiers: [
        { level: 0, label: 'TIER 0 • RAW MANUFACTURERS & OPTO-PLANTS' },
        { level: 1, label: 'TIER 1 • REGIONAL SUPER WHOLESALERS' },
        { level: 2, label: 'TIER 2 • WHOLESALE DISTRIBUTORS & STOCKISTS' },
        { level: 3, label: 'TIER 3 • YOUR ENTERPRISE (CENTRAL NODE)' },
        { level: 4, label: 'TIER 4 • RETAILERS & CONTRACTORS' },
        { level: 5, label: 'TIER 5 • LOCAL CONSUMERS & COMMERCE' },
      ],
    };
  }, [businesses, relationships, myBusiness, hoveredNodeId]);

  const getNodeBorderColor = (role: BusinessRole, isMine: boolean) => {
    if (isMine) return 'border-amber-400 ring-4 ring-amber-300/40 shadow-xl bg-amber-50';
    switch (role) {
      case 'Manufacturer':
        return 'border-rose-400 bg-rose-50/70 hover:border-rose-600';
      case 'Super Wholesaler':
        return 'border-indigo-400 bg-indigo-50/70 hover:border-indigo-600';
      case 'Wholesaler':
        return 'border-blue-400 bg-blue-50/70 hover:border-blue-600';
      case 'Distributor':
        return 'border-amber-400 bg-amber-50/70 hover:border-amber-600';
      case 'Retailer':
        return 'border-emerald-400 bg-emerald-50/70 hover:border-emerald-600';
      case 'Service Provider':
        return 'border-purple-400 bg-purple-50/70 hover:border-purple-600';
      default:
        return 'border-slate-300 bg-white hover:border-slate-500';
    }
  };

  const getNodeRoleBadge = (role: BusinessRole) => {
    switch (role) {
      case 'Manufacturer':
        return 'bg-rose-100 text-rose-800';
      case 'Super Wholesaler':
        return 'bg-indigo-100 text-indigo-800';
      case 'Wholesaler':
        return 'bg-blue-100 text-blue-800';
      case 'Distributor':
        return 'bg-amber-100 text-amber-800';
      case 'Retailer':
        return 'bg-emerald-100 text-emerald-800';
      case 'Service Provider':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Network Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-subtle">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Interactive Supply-Chain Network
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Topology Graph
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visualization of upstream manufacturers, wholesalers, your business, and downstream buyers.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Tier filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium text-slate-600">
            <button
              onClick={() => setSelectedTierFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTierFilter === 'all'
                  ? 'bg-white shadow-xs text-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              All Tiers
            </button>
            <button
              onClick={() => setSelectedTierFilter('upstream')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTierFilter === 'upstream'
                  ? 'bg-white shadow-xs text-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Upstream (Suppliers)
            </button>
            <button
              onClick={() => setSelectedTierFilter('downstream')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                selectedTierFilter === 'downstream'
                  ? 'bg-white shadow-xs text-slate-900 font-semibold'
                  : 'hover:text-slate-900'
              }`}
            >
              Downstream (Buyers)
            </button>
          </div>

          {/* Zoom controls */}
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-white">
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.1))}
              className="p-1 rounded hover:bg-slate-100 text-slate-600"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono font-medium px-1 text-slate-700">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
              className="p-1 rounded hover:bg-slate-100 text-slate-600"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1 rounded hover:bg-slate-100 text-slate-600"
              title="Reset view"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setDashboardView('find_suppliers')}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Find New Supplier
          </button>
        </div>
      </div>

      {/* Main Canvas / Visual Container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Visual Graph Viewport (3 cols) */}
        <div className="lg:col-span-3 bg-slate-900/95 rounded-2xl border border-slate-800 p-4 relative overflow-hidden min-h-[720px] shadow-2xl bg-grid-slate flex flex-col justify-between">
          {/* Top Banner Guide */}
          <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-800/80 backdrop-blur px-4 py-2 rounded-xl border border-slate-700/60 z-10">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Interactive Multi-Tier Supply Flow
            </span>
            <span className="hidden sm:inline">Click any node to view relationship details and counterparty profile</span>
          </div>

          {/* SVG Canvas Area */}
          <div className="relative w-full h-[700px] overflow-auto flex items-center justify-center my-2">
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center top',
                transition: 'transform 0.2s ease-out',
                width: 960,
                height: 880,
                position: 'relative',
              }}
            >
              {/* Tier Background Strips */}
              {tiers.map((t, idx) => (
                <div
                  key={t.level}
                  style={{ top: `${idx * 145 + 10}px` }}
                  className="absolute left-0 right-0 h-28 border-b border-dashed border-slate-800/60 flex items-start px-2 pointer-events-none"
                >
                  <span className="text-[10px] font-mono tracking-wider text-slate-500 font-semibold uppercase">
                    {t.label}
                  </span>
                </div>
              ))}

              {/* SVG Connecting Links */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                <defs>
                  <linearGradient id="flowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#818cf8" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#34d399" stopOpacity="0.8" />
                  </linearGradient>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="8"
                    refX="7"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3.5, 0 7" fill="#6366f1" />
                  </marker>
                </defs>

                {links.map(link => {
                  const x1 = link.source.x;
                  const y1 = link.source.y + 45;
                  const x2 = link.target.x;
                  const y2 = link.target.y - 10;
                  const midY = (y1 + y2) / 2;

                  // Cubic bezier curve
                  const pathData = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;

                  return (
                    <g key={link.id}>
                      {/* Glow background line */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke={link.isHighlighted ? '#6366f1' : '#334155'}
                        strokeWidth={link.isHighlighted ? '2.5' : '1.5'}
                        strokeOpacity={link.isHighlighted ? 0.9 : 0.4}
                      />
                      {/* Flow animation line */}
                      <path
                        d={pathData}
                        fill="none"
                        stroke="url(#flowGrad)"
                        strokeWidth="2"
                        className="animate-flow"
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Render Nodes */}
              {nodes.map(node => {
                const isSelected = selectedNode?.id === node.id;
                const isHovered = hoveredNodeId === node.id;

                // Hide node if tier filter active
                if (selectedTierFilter === 'upstream' && node.tier > 3) return null;
                if (selectedTierFilter === 'downstream' && node.tier < 3) return null;

                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNode(node.business);
                    }}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    style={{
                      left: `${node.x - 110}px`,
                      top: `${node.y}px`,
                      width: '220px',
                    }}
                    className={`absolute z-10 cursor-pointer rounded-xl p-3 border-2 transition-all duration-200 transform hover:-translate-y-1 ${
                      getNodeBorderColor(node.business.primaryRole, node.isMyBusiness)
                    } ${
                      isSelected
                        ? 'ring-2 ring-indigo-400 shadow-2xl scale-105'
                        : 'shadow-md'
                    }`}
                  >
                    {/* Node Header */}
                    <div className="flex items-start justify-between gap-1 mb-1">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${getNodeRoleBadge(
                          node.business.primaryRole
                        )}`}
                      >
                        {node.business.primaryRole}
                      </span>

                      {node.isMyBusiness ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500 text-white shadow-xs">
                          ⭐ YOU
                        </span>
                      ) : (
                        <div className="flex items-center gap-0.5 text-amber-500 text-[11px] font-bold">
                          <Star className="w-3 h-3 fill-amber-400" />
                          <span>{node.business.rating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>

                    {/* Node Title & City */}
                    <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                      {node.business.name}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{node.business.location.city}</span>
                      {node.business.location.distanceKm !== undefined && (
                        <span className="text-emerald-700 font-semibold">
                          {node.business.location.distanceKm === 0 ? 'Base' : `${node.business.location.distanceKm} km`}
                        </span>
                      )}
                    </div>

                    {/* Quick view button inside node */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setInspectingBusiness(node.business);
                      }}
                      className="mt-2 w-full py-1 text-[10px] font-semibold text-slate-700 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors flex items-center justify-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Profile
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 bg-slate-800/90 p-3 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-white">Legend:</span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Manufacturer
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Super Wholesaler
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Wholesaler / Dist.
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-300" /> My Business
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Retail Buyer
              </span>
            </div>
            <span className="text-[11px] text-indigo-300">
              ⚡ Animated pulses reflect active procurement paths
            </span>
          </div>
        </div>

        {/* Selected Node Inspector Drawer (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-card flex flex-col justify-between space-y-4">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 block mb-1">
                  Selected Entity Inspector
                </span>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-base font-bold text-slate-900 leading-tight">
                    {selectedNode.name}
                  </h4>
                  {selectedNode.verified && (
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {selectedNode.location.area}, {selectedNode.location.city}
                </p>
              </div>

              {/* Roles */}
              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">Roles:</span>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.roles.map(r => (
                    <span
                      key={r}
                      className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Rating</span>
                  <strong className="text-slate-900 font-bold flex items-center gap-1 mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {selectedNode.rating.toFixed(1)} ({selectedNode.reviewCount})
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Trust Score</span>
                  <strong className="text-emerald-600 font-bold text-sm block mt-0.5">
                    {selectedNode.trustScore}/100
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Suppliers</span>
                  <strong className="text-slate-800 font-semibold block mt-0.5">
                    {selectedNode.totalSuppliersCount} connected
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Buyers</span>
                  <strong className="text-slate-800 font-semibold block mt-0.5">
                    {selectedNode.totalCustomersCount} active
                  </strong>
                </div>
              </div>

              {/* Relationship summary */}
              <div className="text-xs space-y-2">
                <span className="font-semibold text-slate-700 block">Supply Chain Connection:</span>
                {selectedNode.id === myBusiness.id ? (
                  <p className="text-slate-600 leading-relaxed bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                    This is your registered hub in Ambala Cantt. You purchase from <strong>2 wholesalers</strong> and supply <strong>2 retail buyers & 142 consumers</strong>.
                  </p>
                ) : (
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    Connected in the active regional network. Supplies {selectedNode.categories.slice(0, 2).join(', ')} with high fulfillment reliability.
                  </p>
                )}
              </div>

              <div className="pt-2 space-y-2">
                <button
                  onClick={() => setInspectingBusiness(selectedNode)}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open Full Business Profile
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <Info className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-xs">Click any node in the graph to inspect relationships</p>
            </div>
          )}

          {/* Network Resilience Score */}
          <div className="p-3.5 rounded-xl bg-slate-900 text-white text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-300 font-medium">Supply Redundancy</span>
              <span className="text-emerald-400 font-bold">96% High</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-400 w-[96%]" />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Multi-tier linkage ensures zero downtime if any single supplier faces stock shortage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
