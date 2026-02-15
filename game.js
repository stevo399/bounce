// Game State
const game = {
	balls: 0,
	totalBalls: 0,
	rubber: 0,		// global sum for display (computed from planets)
	clickPower: 1,

	// Flags
	automationOnline: false,
	rubberShortageWarned: false,

	planets: [
		{
			id: 'earth',
			name: 'Earth',
			role: 'hybrid',
			crude: 0, monomers: 0, polymer: 0, compound: 0, finishedRubber: 0, rubber: 0,
			rubberBuildings: { extractor: 0, cracker: 0, reactor: 0, mixer: 0, press: 0, forming: 0 },
			ballBuildings: { basicFactory: 0, advancedFactory: 0, sentientHive: 0, cityOfFactories: 0, dysonFoundry: 0, cosmicHarvester: 0 }
		}
	],

	// Von Neumann probes
	probes: {
		launched: false,
		travelProgress: 0,
		travelDuration: 60,
		arrived: false,
		replicationTimer: 0,
		replicationCycle: 0,
		discoveredPlanets: []
	},
	colonizationCount: 0,
	shippingProbes: { count: 0 },
	constructionProbes: { count: 0, assignments: [], totalBuilt: 0, paused: false },

	cosmic: { currentTier: 0 },
	celestialBodies: { moons: 0, planets: 0, stars: 0, giantStars: 0, blackHoles: 0, supermassiveBlackHoles: 0, galaxies: 0, greatAttractors: 0 },
	celestialStructures: { lunarQuarry: 0, planetaryCoreTap: 0, stellarForge: 0, nebulaCollector: 0, accretionDiskHarvester: 0, hawkingRadiationConverter: 0, darkMatterConverter: 0, cosmicStringResonator: 0 },
	prestige: {
		singularityCount: 0,
		singularityPoints: 0,
		bestTime: Infinity,
		totalBallsAllTime: 0,
		runStartTime: Date.now(),
		upgrades: { production: 0, efficiency: 0, logistics: 0, discovery: 0, cosmic: 0 }
	},
	sandbox: false,

	seen: {},
	upgrades: {},
	achievements: {},
	panelStates: {}
};

// Building definitions
// ===== BUILDING DATA =====
const rubberBuildingData = {
	extractor: { name: 'Oil Extractor', description: 'Pumps crude oil from deep reservoirs', baseCost: 20, costMult: 1.15, produces: 'crude', consumes: null, rate: 1, unlockAt: 200 },
	cracker: { name: 'Cracking Furnace', description: 'Cracks hydrocarbons into monomers', baseCost: 40, costMult: 1.15, produces: 'monomers', consumes: 'crude', rate: 1, unlockAt: 200 },
	reactor: { name: 'Polymerization Reactor', description: 'Polymerizes monomers into long chains', baseCost: 80, costMult: 1.15, produces: 'polymer', consumes: 'monomers', rate: 1, unlockAt: 200 },
	mixer: { name: 'Compounding Mixer', description: 'Mixes polymer with fillers and curatives', baseCost: 150, costMult: 1.15, produces: 'compound', consumes: 'polymer', rate: 1, unlockAt: 200 },
	press: { name: 'Vulcanization Press', description: 'Cross-links polymer chains with heat and sulfur', baseCost: 300, costMult: 1.15, produces: 'finishedRubber', consumes: 'compound', rate: 1, unlockAt: 200 },
	forming: { name: 'Rubber Forming Plant', description: 'Shapes and quality-checks finished rubber', baseCost: 500, costMult: 1.15, produces: 'rubber', consumes: 'finishedRubber', rate: 1, unlockAt: 200 }
};

const ballBuildingData = {
	basicFactory: { name: 'Basic Ball Factory', description: 'Industrial ball production facility', baseCost: 50, costMult: 1.15, ballsPerSec: 2, rubberPerSec: 0.5, unlockAt: 50000 },
	advancedFactory: { name: 'Advanced Ball Factory', description: 'High-efficiency automated ball manufacturing', baseCost: 1000, costMult: 1.15, ballsPerSec: 25, rubberPerSec: 3, unlockAt: 150000 },
	sentientHive: { name: 'Sentient Ball Hive', description: 'Self-aware balls that replicate themselves', baseCost: 25000, costMult: 1.15, ballsPerSec: 500, rubberPerSec: 50, unlockAt: 500000 },
	cityOfFactories: { name: 'City of Factories', description: 'Entire cities dedicated to ball production', baseCost: 500000, costMult: 1.15, ballsPerSec: 10000, rubberPerSec: 500, unlockAt: 5000000 },
	dysonFoundry: { name: 'Dyson Sphere Foundry', description: 'Harnesses stellar energy for massive ball production', baseCost: 10000000, costMult: 1.15, ballsPerSec: 200000, rubberPerSec: 5000, unlockAt: 1000000000 },
	cosmicHarvester: { name: 'Cosmic Harvester', description: 'Converts cosmic energy directly into balls. No rubber required!', baseCost: 5000000, costMult: 1.15, ballsPerSec: 1000, rubberPerSec: 0, unlockAt: 5000000000 }
};

const celestialStructureData = {
	lunarQuarry: { name: 'Lunar Quarry', description: 'Mines bouncy material from moon cores', baseCost: 1e13, costMult: 1.20, ballsPerSec: 1e9, tier: 1 },
	planetaryCoreTap: { name: 'Planetary Core Tap', description: 'Taps planetary cores for ball energy', baseCost: 1e16, costMult: 1.20, ballsPerSec: 1e12, tier: 2 },
	stellarForge: { name: 'Stellar Forge', description: 'Forges balls from stellar plasma', baseCost: 1e19, costMult: 1.20, ballsPerSec: 1e15, tier: 3 },
	nebulaCollector: { name: 'Nebula Collector', description: 'Harvests ball matter from stellar remnants', baseCost: 1e22, costMult: 1.20, ballsPerSec: 1e18, tier: 4 },
	accretionDiskHarvester: { name: 'Accretion Disk Harvester', description: 'Siphons ball energy from black hole accretion disks', baseCost: 1e25, costMult: 1.20, ballsPerSec: 1e21, tier: 5 },
	hawkingRadiationConverter: { name: 'Hawking Radiation Converter', description: 'Converts Hawking radiation into pure balls', baseCost: 1e28, costMult: 1.20, ballsPerSec: 1e24, tier: 6 },
	darkMatterConverter: { name: 'Dark Matter Converter', description: 'Transmutes dark matter into bouncy matter', baseCost: 1e31, costMult: 1.20, ballsPerSec: 1e27, tier: 7 },
	cosmicStringResonator: { name: 'Cosmic String Resonator', description: 'Vibrates cosmic strings to produce infinite balls', baseCost: 1e34, costMult: 1.20, ballsPerSec: 1e30, tier: 8 }
};

// ===== UPGRADE DATA (101 total) =====
const upgradeData = {};

// --- Click Power (5) ---
const clickUpgrades = [
	['click1', 'Stronger Fingers', '+1 per click', 25, 50, 1],
	['click2', 'Rubber Gloves', '+2 per click', 100, 200, 2],
	['click3', 'Spring-Loaded Palm', '+5 per click', 500, 1000, 5],
	['click4', 'Pneumatic Press', '+10 per click', 2500, 5000, 10],
	['click5', 'Quantum Tap', '+25 per click', 15000, 25000, 25]
];
clickUpgrades.forEach(([key, name, desc, cost, unlockBalls, value]) => {
	upgradeData[key] = { name, description: desc, cost, category: 'Click Power',
		unlock: () => game.totalBalls >= unlockBalls,
		effect: { type: 'clickAdd', value } };
});

// --- Auto-Collect (3) ---
const autoUpgrades = [
	['auto1', 'Auto-Bounce', '+1 ball/sec passive income', 150, 500, 1],
	['auto2', 'Auto-Bounce II', '+5 balls/sec passive income', 3000, 5000, 5],
	['auto3', 'Auto-Bounce III', '+25 balls/sec passive income', 15000, 25000, 25]
];
autoUpgrades.forEach(([key, name, desc, cost, unlockBalls, value]) => {
	upgradeData[key] = { name, description: desc, cost, category: 'Automation',
		unlock: () => game.totalBalls >= unlockBalls,
		effect: { type: 'autoCollect', value } };
});

// --- Chain Efficiency (18 = 6 stages x 3 tiers) ---
const chainStageNames = {
	extractor: 'Extraction', cracker: 'Cracking', reactor: 'Polymerization',
	mixer: 'Mixing', press: 'Vulcanization', forming: 'Forming'
};
const effTiers = [
	{ t: 1, prefix: 'Improved', pct: 50, req: 3, costF: 10 },
	{ t: 2, prefix: 'Advanced', pct: 100, req: 8, costF: 50 },
	{ t: 3, prefix: 'Quantum', pct: 200, req: 15, costF: 200 }
];
Object.keys(rubberBuildingData).forEach(stage => {
	const bd = rubberBuildingData[stage];
	const dn = chainStageNames[stage];
	effTiers.forEach(tier => {
		upgradeData[`chain_${stage}_t${tier.t}`] = {
			name: `${tier.prefix} ${dn}`, description: `+${tier.pct}% ${dn.toLowerCase()} output speed`,
			cost: Math.floor(bd.baseCost * tier.costF), category: 'Chain Efficiency',
			unlock: () => getAllRubberBuildings()[stage] >= tier.req,
			effect: { type: 'chainSpeed', stage, value: tier.pct / 100 }
		};
	});
});

// --- Cost Reduction (6 = one per stage) ---
Object.keys(rubberBuildingData).forEach(stage => {
	const bd = rubberBuildingData[stage];
	const dn = chainStageNames[stage];
	upgradeData[`costred_${stage}`] = {
		name: `Efficient ${dn}`, description: `Reduce ${dn.toLowerCase()} cost scaling (1.15x to 1.12x)`,
		cost: Math.floor(bd.baseCost * 100), category: 'Cost Reduction',
		unlock: () => getAllRubberBuildings()[stage] >= 10,
		effect: { type: 'costScale', stage, value: 0.03 }
	};
});

// --- Ball Factory Efficiency (12 = 4 types x 3 tiers) ---
const factoryTiers = [
	{ t: 1, prefix: 'Tuned', pct: 50, req: 5, costF: 5 },
	{ t: 2, prefix: 'Optimized', pct: 100, req: 15, costF: 20 },
	{ t: 3, prefix: 'Perfected', pct: 200, req: 30, costF: 80 }
];
Object.keys(ballBuildingData).forEach(factory => {
	const bd = ballBuildingData[factory];
	factoryTiers.forEach(tier => {
		upgradeData[`factory_${factory}_t${tier.t}`] = {
			name: `${tier.prefix} ${bd.name}`, description: `+${tier.pct}% ${bd.name.toLowerCase()} output`,
			cost: Math.floor(bd.baseCost * tier.costF), category: 'Factory Efficiency',
			unlock: () => getAllBallBuildings()[factory] >= tier.req,
			effect: { type: 'factorySpeed', factory, value: tier.pct / 100 }
		};
	});
});

// --- Bulk Processing (6 = one per stage) ---
Object.keys(rubberBuildingData).forEach(stage => {
	const bd = rubberBuildingData[stage];
	const dn = chainStageNames[stage];
	upgradeData[`bulk_${stage}`] = {
		name: `Bulk ${dn}`, description: `Double ${dn.toLowerCase()} batch size`,
		cost: Math.floor(bd.baseCost * 200), category: 'Bulk Processing',
		unlock: () => getAllRubberBuildings()[stage] >= 10,
		effect: { type: 'bulkSize', stage, value: 2 }
	};
});

// --- Synergy (6) ---
const synergyUpgrades = [
	['synergy1', 'Streamlined Pipeline', 'Own 5+ of each rubber supply chain building: +25% rubber', 50000, 5, 0.25],
	['synergy2', 'Industrial Complex', 'Own 10+ of each rubber supply chain building: +50% rubber', 200000, 10, 0.5],
	['synergy3', 'Manufacturing Empire', 'Own 20+ of each rubber supply chain building: +100% rubber', 1000000, 20, 1.0],
	['synergy4', 'Rubber Baron', 'Own 35+ of each rubber supply chain building: +200% rubber', 5000000, 35, 2.0],
	['synergy5', 'Polymer Singularity', 'Own 50+ of each rubber supply chain building: +400% rubber', 25000000, 50, 4.0],
	['synergy6', 'Molecular Mastery', 'Own 75+ of each rubber supply chain building: +800% rubber', 100000000, 75, 8.0]
];
synergyUpgrades.forEach(([key, name, desc, cost, req, value]) => {
	upgradeData[key] = { name, description: desc, cost, category: 'Synergy',
		unlock: () => { const rb = getAllRubberBuildings(); return Object.values(rb).every(v => v >= req); },
		effect: { type: 'synergyBonus', value } };
});

// --- Planet Prep (4) ---
const planetPrepUpgrades = [
	['prep1', 'Long Range Sensors', 'Detect something... out there', 100000, 100000, { type: 'rubberMult', value: 1.1 }],
	['prep2', 'Signal Processing', 'The signals are getting clearer', 200000, 200000, { type: 'ballMult', value: 1.1 }],
	['prep3', 'Orbital Telescope', 'You can see other worlds now', 350000, 350000, { type: 'rubberMult', value: 1.15 }],
	['prep4', 'Probe Blueprints', 'Unlocks Von Neumann probe launch', 500000, 500000, { type: 'ballMult', value: 1.15 }]
];
planetPrepUpgrades.forEach(([key, name, desc, cost, unlockBalls, effect]) => {
	upgradeData[key] = { name, description: desc, cost, category: 'Discovery',
		unlock: () => game.totalBalls >= unlockBalls, effect };
});

// --- Shipping Fleet (5) - hidden until shipping system exists ---
const shippingUpgrades = [
	['ship1', 'Cargo Optimization', '+50% rubber per shipping probe', 10000000, { type: 'shippingCapMult', value: 1.5 }],
	['ship2', 'Hyperspace Lanes', '+100% shipping capacity', 50000000, { type: 'shippingCapMult', value: 2 }],
	['ship3', 'Quantum Entanglement Shipping', 'Rubber arrives instantly', 200000000, { type: 'shippingInstant', value: 1 }],
	['ship4', 'Fleet Coordination', 'Shipping probes cost 25% less', 100000000, { type: 'shippingCostMult', value: 0.75 }],
	['ship5', 'Galactic Trade Network', 'Surplus rubber auto-sells at 10:1', 500000000, { type: 'autoSell', value: 10 }]
];
shippingUpgrades.forEach(([key, name, desc, cost, effect]) => {
	upgradeData[key] = { name, description: desc, cost, category: 'Shipping',
		unlock: () => game.shippingProbes && game.shippingProbes.count > 0, effect };
});

// --- Construction Automation (5) - hidden until construction system exists ---
const constructionUpgrades = [
	['build1', 'Rapid Assembly', 'Build time -25%', 15000000, { type: 'buildTimeMult', value: 0.75 }],
	['build2', 'Prefabrication', 'Build time -50%', 75000000, { type: 'buildTimeMult', value: 0.5 }],
	['build3', 'Nanoscale Construction', 'Build time -75%', 300000000, { type: 'buildTimeMult', value: 0.25 }],
	['build4', 'Blueprint Sharing', 'Probes build 2 buildings at once', 500000000, { type: 'buildParallel', value: 2 }],
	['build5', 'Self-Improving Builders', 'Probes get faster over time', 800000000, { type: 'buildAccel', value: 1 }]
];
constructionUpgrades.forEach(([key, name, desc, cost, effect]) => {
	upgradeData[key] = { name, description: desc, cost, category: 'Construction',
		unlock: () => game.constructionProbes && game.constructionProbes.count > 0, effect };
});

// --- Planet Mastery (6) ---
const planetUpgrades = [
	['planet1', 'Specialized Workforce', 'Specialized planet bonus: 1.5x to 1.75x', 5000000, () => game.planets.some(p => p.role !== 'hybrid'), { type: 'specialBonus', value: 0.25 }],
	['planet2', 'Expert Workforce', 'Specialized planet bonus: to 2x', 20000000, () => game.planets.filter(p => p.role !== 'hybrid').length >= 3, { type: 'specialBonus', value: 0.25 }],
	['planet3', 'Planetary Governor', 'Hybrid building cap: 25 to 35', 2000000, () => game.planets.some(p => p.role === 'hybrid' && game.planets.length > 1), { type: 'hybridCapAdd', value: 10 }],
	['planet4', 'Regional Planning', 'Hybrid building cap: to 50', 10000000, () => game.planets.filter(p => p.role === 'hybrid').length >= 3, { type: 'hybridCapAdd', value: 15 }],
	['planet5', 'Terraforming I', 'New planets start with 5 pre-built buildings', 15000000, () => game.planets.length >= 5, { type: 'terraform', value: 5 }],
	['planet6', 'Terraforming II', 'New planets start with 15 pre-built buildings', 50000000, () => game.planets.length >= 10, { type: 'terraform', value: 10 }]
];
planetUpgrades.forEach(([key, name, desc, cost, unlock, effect]) => {
	upgradeData[key] = { name, description: desc, cost, category: 'Planets', unlock, effect };
});

// --- Discovery Acceleration (10) - hidden until probe system exists ---
const discoveryUpgrades = [
	['disc1', 'Faster-Than-Light Probes', 'Probe travel time -50%', 30000000, { type: 'probeTravelMult', value: 0.5 }],
	['disc2', 'Parallel Replication', 'Two planets discovered per cycle', 100000000, { type: 'replicationDouble', value: 1 }],
	['disc3', 'Replication Efficiency', 'Cycle time scaling: 1.5x to 1.3x', 250000000, { type: 'replicationScale', value: 1.3 }],
	['disc4', 'Deep Space Network', 'Discoveries happen while offline', 500000000, { type: 'offlineDiscovery', value: 1 }],
	['disc5', 'Swarm Intelligence', '+2 planets per cycle (total 4)', 1e9, { type: 'probeDiscoverBonus', value: 2 }],
	['disc6', 'Warp Probes', 'Base cycle time 60s to 30s', 5e9, { type: 'replicationBaseMult', value: 0.5 }],
	['disc7', 'Exponential Replication', 'Cycle time scaling: 1.3x to 1.15x', 2e10, { type: 'replicationScale', value: 1.15 }],
	['disc8', 'Galactic Swarm', '+4 planets per cycle (total 8)', 1e11, { type: 'probeDiscoverBonus', value: 4 }],
	['disc9', 'Subspace Relay', 'Base cycle time to 10s', 5e11, { type: 'replicationBaseMult', value: 0.333 }],
	['disc10', 'Von Neumann Singularity', 'Cycle time no longer increases', 5e12, { type: 'replicationScale', value: 1.0 }]
];
discoveryUpgrades.forEach(([key, name, desc, cost, effect]) => {
	upgradeData[key] = { name, description: desc, cost, category: 'Discovery',
		unlock: () => game.probes && game.probes.launched, effect };
});

// --- Celestial Acceleration (8) - purchasable during moon tier ---
const celestialAccelUpgrades = [
	['caccel1', 'Moonstone Mining', 'Rubber production x3', 1e12, () => game.celestialBodies.moons >= 3, { type: 'rubberMult', value: 3 }],
	['caccel2', 'Tidal Surge', 'Ball production x3', 5e12, () => game.celestialBodies.moons >= 10, { type: 'ballMult', value: 3 }],
	['caccel3', 'Lunar Foundries', 'Ball factory output x5', 25e12, () => game.celestialBodies.moons >= 25, { type: 'ballMult', value: 5 }],
	['caccel4', 'Gravitational Compression', 'Rubber use halved', 50e12, () => game.celestialBodies.moons >= 50, { type: 'cosmicRubberUseMult', value: 0.5 }],
	['caccel5', 'Orbital Assembly', 'Construction probes build 3x faster', 100e12, () => game.celestialBodies.moons >= 75, { type: 'buildTimeMult', value: 0.333 }],
	['caccel6', 'Celestial Harvest', 'Celestial structures output x5', 250e12, () => game.celestialBodies.moons >= 100, { type: 'celestialStructMult', value: 5 }],
	['caccel7', 'Mass Acceleration', 'All production x10', 1e15, () => game.celestialBodies.moons >= 250, { type: 'ballMult', value: 10 }],
	['caccel8', 'Lunar Convergence', 'All production x25', 5e15, () => game.celestialBodies.moons >= 500, { type: 'ballMult', value: 25 }]
];
celestialAccelUpgrades.forEach(([key, name, desc, cost, unlock, effect]) => {
	upgradeData[key] = { name, description: desc, cost, category: 'Celestial',
		unlock, effect };
});

// --- Celestial Tier Bonuses (9) - auto-granted at each celestial tier ---
const celestialUpgrades = [
	['celestial1', 'Tidal Forces', '+50% rubber production', { type: 'celestialRubberMult', value: 1.5 }, 1],
	['celestial2', 'Planetary Tectonics', 'Click value x10', { type: 'cosmicClickMult', value: 10 }, 2],
	['celestial3', 'Solar Wind', '+100% ball production', { type: 'celestialBallMult', value: 2.0 }, 3],
	['celestial4', 'Supergiant Pressure', 'Ball factories use 25% less rubber', { type: 'cosmicRubberUseMult', value: 0.75 }, 4],
	['celestial5', 'Gravitational Lens', 'All costs reduced 15%', { type: 'cosmicCostMult', value: 0.85 }, 5],
	['celestial6', 'Hawking Insight', 'Chain stages feed 50% faster', { type: 'cosmicChainMult', value: 1.50 }, 6],
	['celestial7', 'Galactic Trade Routes', '3x shipping capacity', { type: 'shippingCapMult', value: 3 }, 7],
	['celestial8', 'Cosmic Resonance', '3x celestial structure output', { type: 'celestialStructMult', value: 3 }, 8],
	['celestial9', 'Singularity Proximity', 'Everything x5', { type: 'cosmicEverythingMult', value: 5 }, 9]
];
celestialUpgrades.forEach(([key, name, desc, effect, tier]) => {
	upgradeData[key] = { name, description: desc, cost: 0, category: 'Cosmic', autoGrant: true,
		unlock: () => game.cosmic && game.cosmic.currentTier >= tier, effect };
});

// --- Prestige Tree (15) - costs Singularity Points ---
const prestigeUpgrades = [
	['prestige_prod1', 'Residual Momentum I', '+20% base production', 1, { type: 'prestigeProd', value: 0.2 }],
	['prestige_prod2', 'Residual Momentum II', '+50% base production', 2, { type: 'prestigeProd', value: 0.3 }],
	['prestige_prod3', 'Residual Momentum III', '+100% base production', 4, { type: 'prestigeProd', value: 0.5 }],
	['prestige_prod4', 'Residual Momentum IV', '+250% base production', 8, { type: 'prestigeProd', value: 1.5 }],
	['prestige_prod5', 'Residual Momentum V', '+500% base production', 15, { type: 'prestigeProd', value: 2.5 }],
	['prestige_eff1', 'Remembered Blueprints I', 'Cost scaling 1.15x to 1.13x', 2, { type: 'prestigeScale', value: 0.02 }],
	['prestige_eff2', 'Remembered Blueprints II', 'Cost scaling to 1.11x', 5, { type: 'prestigeScale', value: 0.02 }],
	['prestige_eff3', 'Remembered Blueprints III', 'Cost scaling to 1.09x', 10, { type: 'prestigeScale', value: 0.02 }],
	['prestige_log1', 'Probe Memory I', 'Start each run with 1 free shipping probe', 1, { type: 'freeShipping', value: 1 }],
	['prestige_log2', 'Probe Memory II', 'Start with 3 free shipping probes', 3, { type: 'freeShipping', value: 2 }],
	['prestige_log3', 'Probe Memory III', 'Start with 10 free shipping probes', 7, { type: 'freeShipping', value: 7 }],
	['prestige_disc1', 'Deja Vu I', 'Von Neumann travel time halved', 3, { type: 'prestigeTravel', value: 0.5 }],
	['prestige_disc2', 'Deja Vu II', 'Von Neumann travel time halved again', 8, { type: 'prestigeTravel', value: 0.5 }],
	['prestige_cosm1', 'Compressed Spacetime I', 'Cosmic tier thresholds -25%', 5, { type: 'prestigeCosmic', value: 0.75 }],
	['prestige_cosm2', 'Compressed Spacetime II', 'Cosmic tier thresholds -50%', 12, { type: 'prestigeCosmic', value: 0.667 }]
];
prestigeUpgrades.forEach(([key, name, desc, spCost, effect]) => {
	upgradeData[key] = { name, description: desc, cost: spCost, currency: 'sp', category: 'Prestige',
		unlock: () => game.prestige && game.prestige.singularityPoints >= 0, effect };
});

const achievementData = [
	{ id: 'first_ball', name: 'First Bounce', description: 'Collect your first ball', check: () => game.totalBalls >= 1 },
	{ id: 'hundred_balls', name: 'Century of Bouncing', description: 'Collect 100 balls', check: () => game.totalBalls >= 100 },
	{ id: 'first_rubber', name: 'Rubber Rookie', description: 'Produce your first rubber', check: () => game.rubber >= 1 },
	{ id: 'automation_start', name: 'Automation Begins', description: 'Build your first ball factory', check: () => getTotalBallBuildings() > 0 },
	{ id: 'supply_chain', name: 'Supply Chain Master', description: 'Complete the rubber supply chain', check: () => hasCompleteSupplyChain() },
	{ id: 'ten_factories', name: 'Mass Production', description: 'Own 10 ball production buildings', check: () => getTotalBallBuildings() >= 10 },
	{ id: 'sentient', name: 'Awakening', description: 'Create sentient balls', check: () => getAllBallBuildings().sentientHive > 0 },
	{ id: 'million_balls', name: 'Megabounce', description: 'Collect 1 million balls', check: () => game.totalBalls >= 1000000 },
	{ id: 'rubber_planet', name: 'Rubber World', description: 'Dedicate a planet to rubber production', check: () => game.planets.some(p => p.role === 'rubber') },
	{ id: 'ball_planet', name: 'Ball World', description: 'Dedicate a planet to ball production', check: () => game.planets.some(p => p.role === 'ball') },
	{ id: 'multi_planet', name: 'Interplanetary Empire', description: 'Control 3 planets', check: () => game.planets.length >= 3 },
	{ id: 'billion_balls', name: 'Gigabounce', description: 'Collect 1 billion balls', check: () => game.totalBalls >= 1000000000 },
	{ id: 'first_probe', name: 'First Contact', description: 'Launch a Von Neumann probe', check: () => game.probes.launched },
	{ id: 'first_discovery', name: 'Self-Replicating', description: 'Discover a planet via probe replication', check: () => game.probes.discoveredPlanets.length > 0 || game.colonizationCount > 0 },
	{ id: 'five_worlds', name: 'Five Worlds', description: 'Colonize 5 planets', check: () => game.planets.length >= 5 },
	{ id: 'logistics', name: 'Logistics Network', description: 'Build your first shipping probe', check: () => game.shippingProbes.count > 0 },
	{ id: 'automated_empire', name: 'Automated Empire', description: 'Build your first construction probe', check: () => game.constructionProbes.count > 0 },
	{ id: 'ten_worlds', name: 'Galactic Industrialist', description: 'Control 10 planets', check: () => game.planets.length >= 10 },
	{ id: 'cosmic_moons', name: 'Lunar Formation', description: 'Form your first Bouncy Moon', check: () => game.cosmic.currentTier >= 1 },
	{ id: 'cosmic_stars', name: 'Stellar Genesis', description: 'Form your first Bouncy Star', check: () => game.cosmic.currentTier >= 3 },
	{ id: 'cosmic_blackhole', name: 'Event Horizon', description: 'Form your first Bouncy Black Hole', check: () => game.cosmic.currentTier >= 5 },
	{ id: 'cosmic_galaxy', name: 'Galactic Architect', description: 'Form your first Bouncy Galaxy', check: () => game.cosmic.currentTier >= 7 },
	{ id: 'cosmic_singularity', name: 'Singularity Achieved', description: 'Reach the Singularity tier', check: () => game.cosmic.currentTier >= 9 },
	{ id: 'celestial_builder', name: 'Celestial Engineer', description: 'Build your first celestial structure', check: () => Object.values(game.celestialStructures).some(c => c > 0) },
	{ id: 'first_prestige', name: 'Universe Reborn', description: 'Perform your first singularity reset', check: () => game.prestige.singularityCount >= 1 },
	{ id: 'trillion_balls', name: 'Terabounce', description: 'Collect 1 trillion balls', check: () => game.totalBalls >= 1e12 },
	{ id: 'ten_trillion_balls', name: 'Decabounce', description: 'Collect 10 trillion balls', check: () => game.totalBalls >= 1e13 },
	{ id: 'quadrillion_balls', name: 'Petabounce', description: 'Collect 1 quadrillion balls', check: () => game.totalBalls >= 1e15 },
	{ id: 'quintillion_balls', name: 'Exabounce', description: 'Collect 1 quintillion balls', check: () => game.totalBalls >= 1e18 },
	{ id: 'sextillion_balls', name: 'Zettabounce', description: 'Collect 1 sextillion balls', check: () => game.totalBalls >= 1e21 },
	{ id: 'septillion_balls', name: 'Yottabounce', description: 'Collect 1 septillion balls', check: () => game.totalBalls >= 1e24 },
	{ id: 'all_world_types', name: 'Balanced Empire', description: 'Control at least one Rubber, Ball, and Hybrid world', check: () => {
		const hasRubber = game.planets.some(p => p.role === 'rubber');
		const hasBall = game.planets.some(p => p.role === 'ball');
		const hasHybrid = game.planets.some(p => p.role === 'hybrid');
		return hasRubber && hasBall && hasHybrid;
	}},
	{ id: 'fifteen_worlds', name: 'Planetary Sovereign', description: 'Control 15 planets', check: () => game.planets.length >= 15 },
	{ id: 'twenty_worlds', name: 'Sector Governor', description: 'Control 20 planets', check: () => game.planets.length >= 20 },
	{ id: 'hundred_factories', name: 'Factory Megacluster', description: 'Own 100 ball production buildings', check: () => getTotalBallBuildings() >= 100 },
	{ id: 'five_hundred_factories', name: 'Factory Ecumenopolis', description: 'Own 500 ball production buildings', check: () => getTotalBallBuildings() >= 500 },
	{ id: 'rubber_titan', name: 'Rubber Titan', description: 'Own 100 total rubber chain buildings', check: () => Object.values(getAllRubberBuildings()).reduce((a, b) => a + b, 0) >= 100 },
	{ id: 'supply_chain_dominance', name: 'Supply Chain Dominance', description: 'Own 50 of each rubber chain building', check: () => {
		const rb = getAllRubberBuildings();
		return Object.values(rb).every(v => v >= 50);
	}},
	{ id: 'shipping_armada', name: 'Shipping Armada', description: 'Build 25 shipping probes', check: () => game.shippingProbes.count >= 25 },
	{ id: 'construction_swarm', name: 'Construction Swarm', description: 'Build 25 construction probes', check: () => game.constructionProbes.count >= 25 },
	{ id: 'structure_foundry', name: 'Celestial Foundry', description: 'Own 10 total celestial structures', check: () => Object.values(game.celestialStructures).reduce((a, b) => a + b, 0) >= 10 },
	{ id: 'structure_empire', name: 'Celestial Empire', description: 'Own 100 total celestial structures', check: () => Object.values(game.celestialStructures).reduce((a, b) => a + b, 0) >= 100 },
	{ id: 'prestige_veteran', name: 'Veteran of Collapse', description: 'Perform 3 singularity resets', check: () => game.prestige.singularityCount >= 3 },
	{ id: 'prestige_master', name: 'Master of Collapse', description: 'Perform 6 singularity resets', check: () => game.prestige.singularityCount >= 6 },
	{ id: 'prestige_legend', name: 'Legend of Collapse', description: 'Perform 10 singularity resets', check: () => game.prestige.singularityCount >= 10 },
	{ id: 'sp_collector', name: 'Singularity Investor', description: 'Accumulate 50 Singularity Points', check: () => game.prestige.singularityPoints >= 50 }
];

// Initialize upgrades and achievements
Object.keys(upgradeData).forEach(key => {
	game.upgrades[key] = { purchased: false };
});
achievementData.forEach(ach => {
	game.achievements[ach.id] = { unlocked: false };
});

let selectedPlanetIndex = 0;
let ballProductionRatio = 0;
let currentBps = 0;
let lastShippingRate = 0;
let shippingPerPlanet = [];
let buyAmount = 1; // 1, 10, or 'max'
let upgradeTabFilter = 'All';
let achievementTabFilter = 'All';

// Utility functions
function formatNumber(num) {
	function trim(s) {
		if (s.indexOf('.') === -1) return s;
		return s.replace(/\.?0+$/, '');
	}
	if (num >= 1e39) return trim((num / 1e39).toFixed(2)) + 'Dd';
	if (num >= 1e36) return trim((num / 1e36).toFixed(2)) + 'Ud';
	if (num >= 1e33) return trim((num / 1e33).toFixed(2)) + 'Dc';
	if (num >= 1e30) return trim((num / 1e30).toFixed(2)) + 'No';
	if (num >= 1e27) return trim((num / 1e27).toFixed(2)) + 'Oc';
	if (num >= 1e24) return trim((num / 1e24).toFixed(2)) + 'Sp';
	if (num >= 1e21) return trim((num / 1e21).toFixed(2)) + 'Sx';
	if (num >= 1e18) return trim((num / 1e18).toFixed(2)) + 'Qi';
	if (num >= 1e15) return trim((num / 1e15).toFixed(2)) + 'Q';
	if (num >= 1e12) return trim((num / 1e12).toFixed(2)) + 'T';
	if (num >= 1e9) return trim((num / 1e9).toFixed(2)) + 'B';
	if (num >= 1e6) return trim((num / 1e6).toFixed(2)) + 'M';
	if (num >= 1e3) return trim((num / 1e3).toFixed(2)) + 'K';
	return trim(num.toFixed(2));
}

function formatDuration(seconds) {
	const total = Math.max(0, Math.ceil(seconds));
	const hours = Math.floor(total / 3600);
	const minutes = Math.floor((total % 3600) / 60);
	const secs = total % 60;
	if (hours > 0) return `${hours} h ${minutes} m ${secs} s`;
	if (minutes > 0) return `${minutes} m ${secs} s`;
	return `${secs} s`;
}

function getBallPurchaseAvailabilityText(cost) {
	if (game.balls >= cost) return 'purchasable now';
	if (currentBps <= 0) return 'purchasable when production starts';
	const etaSeconds = (cost - game.balls) / currentBps;
	if (!Number.isFinite(etaSeconds) || etaSeconds < 0) return 'purchasable soon';
	return `purchasable in ${formatDuration(etaSeconds)}`;
}

function buildBallPurchaseButtonLabel(name, cost) {
	return `${name}, ${formatNumber(cost)} balls, ${getBallPurchaseAvailabilityText(cost)}`;
}

function getCost(baseCost, count, mult) {
	// Softened cost curve: exponent grows slower at high building counts
	// Capped at 100 so prices plateau (reached at ~200 buildings)
	const effectiveCount = Math.min(count / (1 + count * 0.005), 100);
	return Math.floor(baseCost * Math.pow(mult, effectiveCount));
}

function getBulkCost(baseCost, currentCount, mult, amount) {
	let total = 0;
	for (let i = 0; i < amount; i++) {
		total += getCost(baseCost, currentCount + i, mult);
	}
	return total;
}

function getMaxAffordable(baseCost, currentCount, mult, budget) {
	let count = 0;
	let spent = 0;
	while (true) {
		const next = getCost(baseCost, currentCount + count, mult);
		if (spent + next > budget) break;
		spent += next;
		count++;
		if (count > 1000) break;
	}
	return { count, cost: spent };
}

function announcePolite(message) {
	const elem = document.getElementById('polite-announcements');
	elem.textContent = message;
}

function announceAssertive(message) {
	const elem = document.getElementById('assertive-announcements');
	elem.textContent = message;
}

// Aggregation functions
function getAllRubberBuildings() {
	const totals = { extractor: 0, cracker: 0, reactor: 0, mixer: 0, press: 0, forming: 0 };
	game.planets.forEach(planet => {
		Object.keys(totals).forEach(key => {
			totals[key] += planet.rubberBuildings[key] || 0;
		});
	});
	return totals;
}

function getAllBallBuildings() {
	const totals = { basicFactory: 0, advancedFactory: 0, sentientHive: 0, cityOfFactories: 0, dysonFoundry: 0, cosmicHarvester: 0 };
	game.planets.forEach(planet => {
		Object.keys(totals).forEach(key => {
			totals[key] += planet.ballBuildings[key] || 0;
		});
	});
	return totals;
}

function getTotalBallBuildings() {
	const all = getAllBallBuildings();
	return Object.values(all).reduce((sum, val) => sum + val, 0);
}

function hasCompleteSupplyChain() {
	const all = getAllRubberBuildings();
	return all.extractor > 0 && all.cracker > 0 && all.reactor > 0 &&
		   all.mixer > 0 && all.press > 0 && all.forming > 0;
}

// Core game functions
function collectBalls() {
	const eff = getEffects();
	const amount = (1 + eff.clickAdd) * eff.cosmicClickMult;
	game.balls += amount;
	game.totalBalls += amount;
	updateDisplay();
	checkAchievements();
}

function buyRubberBuilding(planetIndex, buildingKey) {
	const planet = game.planets[planetIndex];
	if (planet.role === 'ball') { announcePolite('Ball Worlds cannot build rubber infrastructure.'); return; }
	const data = rubberBuildingData[buildingKey];
	let currentCount = planet.rubberBuildings[buildingKey];
	const eff = getEffects();
	const pe = getPrestigeEffects();
	const costScale = Math.max(1.01, data.costMult - (eff.costScaleReduction[buildingKey] || 0) - pe.costScaleReduction);
	const effectiveMult = costScale;

	// Building cap: hybrid uses hybrid cap, specialized uses 200
	let cap = 200;
	if (planet.role === 'hybrid') {
		cap = 25 + eff.hybridCapAdd;
	}
	if (currentCount >= cap) {
		announcePolite(`Building cap reached (${cap}).${planet.role === 'hybrid' ? ' Specialize this planet for higher cap.' : ''}`);
		return;
	}

	let amount = 1;
	if (buyAmount === 'max') {
		const maxInfo = getMaxAffordable(data.baseCost, currentCount, effectiveMult, game.balls / eff.costMult);
		amount = Math.min(maxInfo.count, cap - currentCount);
	} else {
		amount = Math.min(buyAmount, cap - currentCount);
	}
	if (amount <= 0) amount = 1;

	const totalCost = Math.floor(getBulkCost(data.baseCost, currentCount, effectiveMult, amount) * eff.costMult);

	if (game.balls >= totalCost) {
		game.balls -= totalCost;
		planet.rubberBuildings[buildingKey] += amount;
		announcePolite(`Purchased ${amount} ${data.name} on ${planet.name}. Total: ${planet.rubberBuildings[buildingKey]}`);
		updateDisplay(true);
		checkAchievements();
	} else {
		const singleCost = Math.floor(getCost(data.baseCost, currentCount, effectiveMult) * eff.costMult);
		announcePolite(`Not enough balls. Need ${formatNumber(singleCost)}, you have ${formatNumber(game.balls)}`);
	}
}

function buyBallBuilding(planetIndex, buildingKey) {
	const planet = game.planets[planetIndex];
	if (planet.role === 'rubber') { announcePolite('Rubber Worlds cannot build ball factories.'); return; }
	const data = ballBuildingData[buildingKey];
	let currentCount = planet.ballBuildings[buildingKey];
	const eff = getEffects();
	const pe = getPrestigeEffects();
	const costScale = Math.max(1.01, data.costMult - pe.costScaleReduction);

	// Building cap: hybrid uses hybrid cap, specialized uses 200
	let cap = 200;
	if (planet.role === 'hybrid') {
		cap = 25 + eff.hybridCapAdd;
	}
	if (currentCount >= cap) {
		announcePolite(`Building cap reached (${cap}).${planet.role === 'hybrid' ? ' Specialize this planet for higher cap.' : ''}`);
		return;
	}

	let amount = 1;
	if (buyAmount === 'max') {
		const maxInfo = getMaxAffordable(data.baseCost, currentCount, costScale, game.balls / eff.costMult);
		amount = Math.min(maxInfo.count, cap - currentCount);
	} else {
		amount = Math.min(buyAmount, cap - currentCount);
	}
	if (amount <= 0) amount = 1;

	const totalCost = Math.floor(getBulkCost(data.baseCost, currentCount, costScale, amount) * eff.costMult);

	if (game.balls >= totalCost) {
		game.balls -= totalCost;
		planet.ballBuildings[buildingKey] += amount;
		announcePolite(`Purchased ${amount} ${data.name} on ${planet.name}. Total: ${planet.ballBuildings[buildingKey]}`);
		updateDisplay(true);
		checkAchievements();
	} else {
		const singleCost = Math.floor(getCost(data.baseCost, currentCount, costScale) * eff.costMult);
		announcePolite(`Not enough balls. Need ${formatNumber(singleCost)}, you have ${formatNumber(game.balls)}`);
	}
}

function sellRubber() {
	const planet = game.planets[selectedPlanetIndex];
	if (planet.rubber <= 0) {
		announcePolite('No rubber to sell on this planet.');
		return;
	}
	const amount = planet.rubber;
	const ballsGained = Math.floor(amount * 5);
	planet.rubber = 0;
	game.balls += ballsGained;
	game.totalBalls += ballsGained;
	announcePolite(`Sold ${formatNumber(amount)} rubber for ${formatNumber(ballsGained)} balls.`);
	updateDisplay(true);
	checkAchievements();
}

function buyCelestialStructure(key) {
	const data = celestialStructureData[key];
	if (!data) return;
	if (game.cosmic.currentTier < data.tier) { announcePolite('Tier not reached yet.'); return; }
	const currentCount = game.celestialStructures[key];

	let amount = 1;
	if (buyAmount === 'max') {
		amount = Math.max(1, getMaxAffordable(data.baseCost, currentCount, data.costMult, game.balls).count);
	} else {
		amount = buyAmount === 10 ? 10 : 1;
	}

	const totalCost = getBulkCost(data.baseCost, currentCount, data.costMult, amount);

	if (game.balls >= totalCost) {
		game.balls -= totalCost;
		game.celestialStructures[key] += amount;
		announcePolite(`Built ${amount} ${data.name}. Total: ${game.celestialStructures[key]}`);
		updateDisplay(true);
	} else {
		const singleCost = getCost(data.baseCost, currentCount, data.costMult);
		announcePolite(`Not enough balls. Need ${formatNumber(singleCost)}, you have ${formatNumber(game.balls)}`);
	}
}

function buyUpgrade(upgradeKey) {
	const upgrade = game.upgrades[upgradeKey];
	const data = upgradeData[upgradeKey];

	if (!upgrade.purchased && game.balls >= data.cost) {
		game.balls -= data.cost;
		upgrade.purchased = true;
		saveGame();
		// Flash the button before it disappears
		const btn = document.getElementById(`upgrade-btn-${upgradeKey}`);
		if (btn) {
			btn.textContent = 'Purchased!';
			btn.style.background = 'var(--color-success)';
		}
		announcePolite(`Upgrade unlocked: ${data.name}. ${data.description}`);
		setTimeout(() => { updateDisplay(true); checkAchievements(); }, 400);
	} else if (upgrade.purchased) {
		announcePolite('Upgrade already purchased');
	} else {
		announcePolite(`Not enough balls. Need ${formatNumber(data.cost)}, you have ${formatNumber(game.balls)}`);
	}
}

function addPlanet(name, role) {
	const newPlanet = {
		id: `planet_${game.planets.length}`,
		name: name,
		role: role,
		crude: 0, monomers: 0, polymer: 0, compound: 0, finishedRubber: 0, rubber: 0,
		rubberBuildings: { extractor: 0, cracker: 0, reactor: 0, mixer: 0, press: 0, forming: 0 },
		ballBuildings: { basicFactory: 0, advancedFactory: 0, sentientHive: 0, cityOfFactories: 0, dysonFoundry: 0, cosmicHarvester: 0 }
	};
	game.planets.push(newPlanet);
	announcePolite(`New planet colonized: ${name}. Role: ${role}`);
	updateDisplay(true);
	checkAchievements();
}

function changePlanetRole(planetIndex, newRole) {
	const planet = game.planets[planetIndex];
	const oldRole = planet.role;
	if (oldRole === newRole) return;

	const totalRb = Object.values(planet.rubberBuildings).reduce((a, b) => a + b, 0);
	const totalBb = Object.values(planet.ballBuildings).reduce((a, b) => a + b, 0);
	const totalBuildings = totalRb + totalBb;
	const cost = 2000 * game.planets.length;

	if (planet.rubber < cost) {
		const hint = planet.role === 'ball' ? ' Ship rubber here first using shipping probes.' : '';
		announcePolite(`Need ${formatNumber(cost)} rubber on ${planet.name}. Has ${formatNumber(planet.rubber)}.${hint}`);
		return;
	}

	if (!confirm(`Reshape ${planet.name} into ${newRole}?\n\nThis will:\n- Destroy all ${totalBuildings} buildings\n- Cost ${formatNumber(cost)} rubber\n- Reset all production on this planet\n\nThis cannot be undone.`)) return;

	planet.rubber -= cost;
	Object.keys(planet.rubberBuildings).forEach(k => planet.rubberBuildings[k] = 0);
	Object.keys(planet.ballBuildings).forEach(k => planet.ballBuildings[k] = 0);
	planet.crude = 0; planet.monomers = 0; planet.polymer = 0;
	planet.compound = 0; planet.finishedRubber = 0;
	planet.role = newRole;

	announcePolite(`${planet.name} reshaped to ${newRole}. All buildings destroyed.`);
	saveGame();
	updateDisplay(true);
}

// ===== EFFECT SYSTEM =====
let _cachedEffects = null;
let _effectsFrame = -1;
let _currentFrame = 0;
function getEffects() {
	if (_effectsFrame === _currentFrame && _cachedEffects) return _cachedEffects;
	const eff = {
		clickAdd: 0, ballMult: 1, rubberMult: 1, autoCollect: 0,
		chainSpeed: {}, costScaleReduction: {}, factorySpeed: {}, bulkSize: {},
		synergyBonus: 0, specialBonus: 0, hybridCapAdd: 0, terraformCount: 0,
		shippingCapMult: 1, shippingCostMult: 1, shippingInstant: false, autoSellRatio: 0,
		buildTimeMult: 1, buildParallel: 1, buildAccel: false,
		cosmicClickMult: 1, cosmicOutputMult: 1, cosmicChainMult: 1,
		rubberUseMult: 1, costMult: 1, cosmicEverythingMult: 1,
		celestialRubberMult: 1, celestialBallMult: 1, celestialStructMult: 1,
		probeTravelMult: 1, replicationDouble: false, replicationScale: 1.5, offlineDiscovery: false,
		probeDiscoverBonus: 0, replicationBaseMult: 1
	};
	Object.keys(upgradeData).forEach(key => {
		if (!game.upgrades[key] || !game.upgrades[key].purchased) return;
		const e = upgradeData[key].effect;
		if (!e) return;
		switch (e.type) {
			case 'clickAdd': eff.clickAdd += e.value; break;
			case 'ballMult': eff.ballMult *= e.value; break;
			case 'rubberMult': eff.rubberMult *= e.value; break;
			case 'autoCollect': eff.autoCollect += e.value; break;
			case 'chainSpeed':
				eff.chainSpeed[e.stage] = (eff.chainSpeed[e.stage] || 0) + e.value; break;
			case 'costScale':
				eff.costScaleReduction[e.stage] = (eff.costScaleReduction[e.stage] || 0) + e.value; break;
			case 'factorySpeed':
				eff.factorySpeed[e.factory] = (eff.factorySpeed[e.factory] || 0) + e.value; break;
			case 'bulkSize':
				eff.bulkSize[e.stage] = (eff.bulkSize[e.stage] || 1) * e.value; break;
			case 'synergyBonus': eff.synergyBonus += e.value; break;
			case 'specialBonus': eff.specialBonus += e.value; break;
			case 'hybridCapAdd': eff.hybridCapAdd += e.value; break;
			case 'terraform': eff.terraformCount += e.value; break;
			case 'shippingCapMult': eff.shippingCapMult *= e.value; break;
			case 'shippingCostMult': eff.shippingCostMult *= e.value; break;
			case 'shippingInstant': eff.shippingInstant = true; break;
			case 'autoSell': eff.autoSellRatio = e.value; break;
			case 'buildTimeMult': eff.buildTimeMult *= e.value; break;
			case 'buildParallel': eff.buildParallel = Math.max(eff.buildParallel, e.value); break;
			case 'buildAccel': eff.buildAccel = true; break;
			case 'cosmicClickMult': eff.cosmicClickMult *= e.value; break;
			case 'cosmicOutputMult': eff.cosmicOutputMult *= e.value; break;
			case 'cosmicChainMult': eff.cosmicChainMult *= e.value; break;
			case 'cosmicRubberUseMult': eff.rubberUseMult *= e.value; break;
			case 'cosmicCostMult': eff.costMult *= e.value; break;
			case 'cosmicEverythingMult': eff.cosmicEverythingMult *= e.value; break;
			case 'celestialRubberMult': eff.celestialRubberMult *= e.value; break;
			case 'celestialBallMult': eff.celestialBallMult *= e.value; break;
			case 'celestialStructMult': eff.celestialStructMult *= e.value; break;
			case 'probeTravelMult': eff.probeTravelMult *= e.value; break;
			case 'replicationDouble': eff.replicationDouble = true; break;
			case 'replicationScale': eff.replicationScale = e.value; break;
			case 'offlineDiscovery': eff.offlineDiscovery = true; break;
			case 'probeDiscoverBonus': eff.probeDiscoverBonus += e.value; break;
			case 'replicationBaseMult': eff.replicationBaseMult *= e.value; break;
		}
	});
	eff.rubberMult = eff.rubberMult * (1 + eff.synergyBonus);

	// Apply cosmic upgrade bonuses
	eff.ballMult *= eff.cosmicOutputMult;
	eff.rubberMult *= eff.cosmicOutputMult;
	// Apply celestial tier multipliers
	eff.rubberMult *= eff.celestialRubberMult;
	eff.ballMult *= eff.celestialBallMult;
	// cosmicChainMult: "25% faster" means multiply the total rate (1 + chainSpeed) by the factor
	// Convert: (1 + old) * mult = 1 + new => new = (1 + old) * mult - 1
	if (eff.cosmicChainMult !== 1) {
		Object.keys(eff.chainSpeed).forEach(stage => {
			eff.chainSpeed[stage] = (1 + (eff.chainSpeed[stage] || 0)) * eff.cosmicChainMult - 1;
		});
	}
	eff.ballMult *= eff.cosmicEverythingMult;
	eff.rubberMult *= eff.cosmicEverythingMult;
	eff.clickAdd *= eff.cosmicEverythingMult;
	eff.autoCollect *= eff.cosmicEverythingMult;

	// Apply cosmic tier multiplier
	const cosmicMult = getCosmicMultiplier();
	eff.ballMult *= cosmicMult;
	eff.rubberMult *= cosmicMult;

	// Apply prestige bonuses
	const pe = getPrestigeEffects();
	eff.ballMult *= pe.prodMult;
	eff.rubberMult *= pe.prodMult;

	// Planet synergy: each planet beyond 5 gives +25% global production
	const synergyPlanets = Math.max(0, game.planets.length - 5);
	if (synergyPlanets > 0) {
		const planetSynergyMult = 1 + synergyPlanets * 0.25;
		eff.ballMult *= planetSynergyMult;
		eff.rubberMult *= planetSynergyMult;
	}

	// Empire momentum: total buildings across all planets boost global production
	let totalBuildings = 0;
	game.planets.forEach(p => {
		Object.values(p.rubberBuildings).forEach(c => totalBuildings += c);
		Object.values(p.ballBuildings).forEach(c => totalBuildings += c);
	});
	if (totalBuildings > 0) {
		const empireMult = 1 + Math.log2(1 + totalBuildings) * 0.15;
		eff.ballMult *= empireMult;
		eff.rubberMult *= empireMult;
		eff.empireMomentum = empireMult;
	} else {
		eff.empireMomentum = 1;
	}

	_cachedEffects = eff;
	_effectsFrame = _currentFrame;
	return eff;
}

// Legacy compatibility wrapper
function getUpgradeMultipliers() {
	const eff = getEffects();
	return { ballMult: eff.ballMult, rubberMult: eff.rubberMult };
}

// ===== TOAST NOTIFICATIONS =====
function showToast(title, description) {
	const container = document.getElementById('toast-container');
	const toast = document.createElement('div');
	toast.className = 'toast';
	const strong = document.createElement('strong');
	strong.textContent = title;
	toast.appendChild(strong);
	if (description) {
		toast.appendChild(document.createElement('br'));
		const desc = document.createElement('span');
		desc.className = 'toast-desc';
		desc.textContent = description;
		toast.appendChild(desc);
	}
	container.appendChild(toast);
	announcePolite(title + (description ? '. ' + description : ''));
	setTimeout(() => toast.remove(), 4000);
}

// ===== PROGRESSIVE UNLOCK ENGINE =====
const milestones = [
	{ id: 'upgrades', test: () => game.totalBalls >= 50, title: 'Upgrades Available!', desc: 'New ways to boost your production.', show: ['#upgrades-panel'] },
	{ id: 'achievements', test: () => game.totalBalls >= 10, title: 'Achievements!', desc: 'Track your progress.', show: ['#achievements-panel'] },
	{ id: 'stat_rubber', test: () => game.totalBalls >= 200, show: ['#stat-rubber', '#stat-rps'] },
	{ id: 'rubber_panel', test: () => game.totalBalls >= 200, title: 'Rubber Supply Chain Unlocked!', desc: 'The full rubber pipeline is yours to command.', show: ['#rubber-panel'] },
	{ id: 'stat_bps', test: () => game.upgrades.auto1 && game.upgrades.auto1.purchased, show: ['#stat-bps'] },
	{ id: 'ball_panel', test: () => game.totalBalls >= 50000, title: 'Ball Factory Unlocked!', desc: 'Automated ball production begins!', show: ['#production-panel'] },
	{ id: 'advancedFactory', test: () => game.totalBalls >= 150000, title: 'Advanced Factory Unlocked!', desc: 'High-efficiency manufacturing.' },
	{ id: 'sentientHive', test: () => game.totalBalls >= 500000, title: 'Sentient Ball Hive Unlocked!', desc: 'The balls... are alive?' },
	{ id: 'planets_panel', test: () => game.upgrades.prep4 && game.upgrades.prep4.purchased, title: 'Planets Discovered!', desc: 'Launch probes to colonize new worlds!', show: ['#planets-panel', '#stat-planets'] },
	{ id: 'cityOfFactories', test: () => game.totalBalls >= 5000000, title: 'City of Factories Unlocked!', desc: 'Industrial mega-complexes!' },
	{ id: 'logistics_panel', test: () => game.planets.length >= 2, title: 'Logistics Network!', desc: 'Ship rubber between planets and automate construction.', show: ['#logistics-panel'] },
	{ id: 'dysonFoundry', test: () => game.totalBalls >= 1000000000, title: 'Dyson Sphere Foundry Unlocked!', desc: 'Harness the power of stars!' },
	{ id: 'cosmic_panel', test: () => game.totalBalls >= 1e13, title: 'Celestial Bodies!', desc: 'Your balls are forming celestial bodies!', show: ['#cosmic-panel'] },
	{ id: 'cosmicHarvester', test: () => game.totalBalls >= 5e9, title: 'Cosmic Harvester Unlocked!', desc: 'Convert cosmic energy directly into balls!' },
	{ id: 'celestial_star', test: () => game.cosmic.currentTier >= 3, title: 'Stellar Genesis!', desc: 'Your bouncy star illuminates the cosmos!' },
	{ id: 'celestial_blackhole', test: () => game.cosmic.currentTier >= 5, title: 'Event Horizon!', desc: 'A bouncy black hole bends spacetime!' },
	{ id: 'celestial_galaxy', test: () => game.cosmic.currentTier >= 7, title: 'Galactic Formation!', desc: 'A bouncy galaxy spirals into existence!' },
	{ id: 'prestige_panel', test: () => game.prestige.singularityCount > 0 || game.cosmic.currentTier >= 9, title: 'Singularity!', desc: 'Collapse the universe for ultimate power.', show: ['#prestige-panel'] }
];

const progressionStages = [
	{ threshold: 10, name: 'Achievements', reached: () => game.totalBalls >= 10 },
	{ threshold: 50, name: 'Upgrades', reached: () => game.totalBalls >= 50 },
	{ threshold: 200, name: 'Rubber Supply Chain', reached: () => game.totalBalls >= 200 },
	{ threshold: 50000, name: 'Ball Production', reached: () => game.totalBalls >= 50000 },
	{ threshold: 150000, name: 'Advanced Factory', reached: () => game.totalBalls >= 150000 },
	{ threshold: 500000, name: 'Sentient Ball Hive', reached: () => game.totalBalls >= 500000 },
	{ threshold: 5000000, name: 'City of Factories', reached: () => game.totalBalls >= 5000000 },
	{ threshold: 1000000000, name: 'Dyson Sphere Foundry', reached: () => game.totalBalls >= 1000000000 },
	{ threshold: 5000000000, name: 'Cosmic Harvester', reached: () => game.totalBalls >= 5000000000 },
	{ threshold: 1e13, name: 'Celestial Bodies', reached: () => game.totalBalls >= 1e13 }
];

function updateNextStage() {
	const el = document.getElementById('next-stage');
	const textEl = document.getElementById('next-stage-text');
	const next = progressionStages.find(s => !s.reached());
	if (!next) {
		el.style.display = 'none';
		return;
	}
	el.style.display = '';
	const remaining = next.threshold - game.totalBalls;
	textEl.textContent = next.name + ' (' + formatNumber(remaining) + ' more balls)';
}

function checkMilestones() {
	milestones.forEach(m => {
		if (game.seen[m.id]) return;
		if (!m.test()) return;
		game.seen[m.id] = true;
		if (m.title) showToast(m.title, m.desc);
		if (m.show) m.show.forEach(sel => {
			const el = document.querySelector(sel);
			if (el) el.style.display = '';
		});
	});
	// Also show panels for already-seen milestones (needed on page load)
	milestones.forEach(m => {
		if (!game.seen[m.id]) return;
		if (m.show) m.show.forEach(sel => {
			const el = document.querySelector(sel);
			if (el) el.style.display = '';
		});
	});
	// Auto-grant cosmic upgrades
	Object.keys(upgradeData).forEach(key => {
		const data = upgradeData[key];
		if (data.autoGrant && data.unlock() && !game.upgrades[key].purchased) {
			game.upgrades[key].purchased = true;
			showToast(data.name + ' Granted!', data.description);
		}
	});
}

function checkAchievements() {
	achievementData.forEach(ach => {
		if (!game.achievements[ach.id].unlocked && ach.check()) {
			game.achievements[ach.id].unlocked = true;
			announcePolite(`Achievement unlocked: ${ach.name}. ${ach.description}`);
			renderAchievements();
		}
	});
}

// Save/Load system
function saveGame() {
	if (resetting) return;
	const prestigeSave = Object.assign({}, game.prestige, {
		bestTime: Number.isFinite(game.prestige.bestTime) ? game.prestige.bestTime : null
	});
	const saveData = {
		balls: game.balls,
		totalBalls: game.totalBalls,
		rubber: game.rubber,
		clickPower: game.clickPower,
		automationOnline: game.automationOnline,
		rubberShortageWarned: game.rubberShortageWarned,
		planets: game.planets,
		probes: game.probes,
		colonizationCount: game.colonizationCount,
		shippingProbes: game.shippingProbes,
		constructionProbes: { count: game.constructionProbes.count, totalBuilt: game.constructionProbes.totalBuilt, paused: game.constructionProbes.paused },
		cosmic: game.cosmic,
		celestialBodies: game.celestialBodies,
		celestialStructures: game.celestialStructures,
		prestige: prestigeSave,
		sandbox: game.sandbox,
		upgrades: game.upgrades,
		achievements: game.achievements,
		seen: game.seen,
		panelStates: game.panelStates,
		lastSaveTime: Date.now()
	};
	localStorage.setItem('bouncingBallUniverse', JSON.stringify(saveData));
}

function loadGame() {
	const saved = localStorage.getItem('bouncingBallUniverse');
	if (!saved) return false;

	try {
		const s = JSON.parse(saved);
		game.balls = s.balls || 0;
		game.totalBalls = s.totalBalls || 0;
		game.rubber = s.rubber || 0;
		game.clickPower = s.clickPower || 1;
		game.automationOnline = s.automationOnline || false;
		game.rubberShortageWarned = s.rubberShortageWarned || false;
		if (s.planets) {
			game.planets = s.planets;
			game.planets.forEach(planet => {
				// Ensure building keys exist
				Object.keys(rubberBuildingData).forEach(key => {
					if (planet.rubberBuildings[key] === undefined) planet.rubberBuildings[key] = 0;
				});
				Object.keys(ballBuildingData).forEach(key => {
					if (planet.ballBuildings[key] === undefined) planet.ballBuildings[key] = 0;
				});
				// Clamp buildings to cap (200 for specialized, hybrid cap for hybrid)
				const buildCap = planet.role === 'hybrid' ? 50 : 200;
				Object.keys(planet.rubberBuildings).forEach(key => {
					if (planet.rubberBuildings[key] > buildCap) planet.rubberBuildings[key] = buildCap;
				});
				Object.keys(planet.ballBuildings).forEach(key => {
					if (planet.ballBuildings[key] > buildCap) planet.ballBuildings[key] = buildCap;
				});
				// Migrate: add per-planet resources if missing (old save)
				if (planet.crude === undefined) {
					planet.crude = 0; planet.monomers = 0; planet.polymer = 0;
					planet.compound = 0; planet.finishedRubber = 0; planet.rubber = 0;
				}
			});
			// Migrate global resources to Earth (first planet) if old save
			if (s.crude !== undefined && game.planets[0]) {
				game.planets[0].crude += s.crude || 0;
				game.planets[0].monomers += s.monomers || 0;
				game.planets[0].polymer += s.polymer || 0;
				game.planets[0].compound += s.compound || 0;
				game.planets[0].finishedRubber += s.finishedRubber || 0;
				game.planets[0].rubber += s.rubber || 0;
			}
		}
		// Load probes state
		if (s.probes) {
			Object.assign(game.probes, s.probes);
			if (!game.probes.discoveredPlanets) game.probes.discoveredPlanets = [];
			// Trim excess discovered planets from old saves
			if (game.probes.discoveredPlanets.length > 20) game.probes.discoveredPlanets.length = 20;
		}
		game.colonizationCount = s.colonizationCount || 0;
		if (s.shippingProbes) game.shippingProbes.count = s.shippingProbes.count || 0;
		if (s.constructionProbes) {
			game.constructionProbes.count = s.constructionProbes.count || 0;
			game.constructionProbes.totalBuilt = s.constructionProbes.totalBuilt || 0;
			game.constructionProbes.paused = s.constructionProbes.paused || false;
		}
		if (s.cosmic) Object.assign(game.cosmic, s.cosmic);
		// Load celestial state with defaults for missing keys
		if (s.celestialBodies) {
			Object.keys(game.celestialBodies).forEach(key => {
				if (s.celestialBodies[key] !== undefined) game.celestialBodies[key] = s.celestialBodies[key];
			});
		}
		if (s.celestialStructures) {
			Object.keys(game.celestialStructures).forEach(key => {
				if (s.celestialStructures[key] !== undefined) game.celestialStructures[key] = s.celestialStructures[key];
			});
		}
		// Migration: revalidate cosmic tier against new thresholds
		if (game.cosmic.currentTier > 0) {
			let validTier = 0;
			for (let i = 0; i < CELESTIAL_TIERS.length; i++) {
				if (game.totalBalls >= CELESTIAL_TIERS[i].threshold) validTier = i + 1;
				else break;
			}
			game.cosmic.currentTier = validTier;
		}
		if (s.prestige) {
			Object.assign(game.prestige, s.prestige);
			if (!game.prestige.upgrades) game.prestige.upgrades = { production: 0, efficiency: 0, logistics: 0, discovery: 0, cosmic: 0 };
			if (!game.prestige.runStartTime) game.prestige.runStartTime = Date.now();
			if (!Number.isFinite(game.prestige.bestTime) || game.prestige.bestTime <= 0) {
				game.prestige.bestTime = Infinity;
			}
		}
		if (s.sandbox) game.sandbox = true;
		if (s.upgrades) {
			Object.keys(s.upgrades).forEach(key => {
				if (game.upgrades[key]) game.upgrades[key] = s.upgrades[key];
			});
		}
		if (s.achievements) {
			Object.keys(s.achievements).forEach(key => {
				if (game.achievements[key]) game.achievements[key] = s.achievements[key];
			});
		}
		if (s.panelStates) game.panelStates = s.panelStates;
		migratePlanetNames();

		// Load seen state, or populate from current progress (migration)
		if (s.seen) {
			game.seen = s.seen;
		} else {
			milestones.forEach(m => { if (m.test()) game.seen[m.id] = true; });
		}

		// Offline discovery: simulate probe discoveries while away
		if (s.lastSaveTime && game.probes.arrived) {
			const eff = getEffects();
			if (eff.offlineDiscovery) {
				const elapsed = Math.max(0, Math.min((Date.now() - s.lastSaveTime) / 1000, 604800)); // cap at 7 days
				let remaining = elapsed;
				let offlineCycles = 0;
				while (remaining > 0 && offlineCycles < 50) {
					const baseCycle = 60 * eff.replicationBaseMult;
					const cycleDuration = baseCycle * Math.pow(eff.replicationScale, game.probes.replicationCycle);
					const timeLeft = cycleDuration - game.probes.replicationTimer;
					if (remaining >= timeLeft) {
						remaining -= timeLeft;
						game.probes.replicationTimer = 0;
						game.probes.replicationCycle++;
						offlineCycles++;
						const count = (eff.replicationDouble ? 2 : 1) + eff.probeDiscoverBonus;
						for (let i = 0; i < count; i++) {
							if (game.probes.discoveredPlanets.length >= 20) break;
							const newName = generatePlanetName();
							game.probes.discoveredPlanets.push({
								id: `planet_${Date.now()}_offline_${i}`,
								name: newName
							});
						}
					} else {
						game.probes.replicationTimer += remaining;
						remaining = 0;
					}
				}
			}
		}

		return true;
	} catch (e) {
		console.error('Failed to load save:', e);
		return false;
	}
}

function selectPlanet(index) {
	selectedPlanetIndex = parseInt(index);
	const rubberContainer = document.getElementById('rubber-buildings-container');
	rubberContainer.innerHTML = '';
	delete rubberContainer.dataset.planetKey;
	const ballContainer = document.getElementById('ball-buildings-container');
	ballContainer.innerHTML = '';
	delete ballContainer.dataset.planetKey;
	updateDisplay(true);
}

function renderPlanetSelector() {
	const panel = document.getElementById('planet-selector');
	if (game.planets.length <= 1) {
		panel.style.display = 'none';
		selectedPlanetIndex = 0;
		return;
	}
	panel.style.display = 'block';

	const select = document.getElementById('planet-select');
	const key = game.planets.map(p => `${p.name}:${p.role}`).join('|');

	if (select.dataset.key !== key) {
		select.dataset.key = key;
		select.innerHTML = '';
		game.planets.forEach((planet, index) => {
			const option = document.createElement('option');
			option.value = index;
			option.textContent = `${planet.name} (${planet.role})`;
			select.appendChild(option);
		});
	}
	select.value = selectedPlanetIndex;
}

// Game loop
// Planet name generation for discoveries
const legacyPlanetNameBases = ['Alpha Centauri', 'Proxima', 'Kepler', 'TRAPPIST', 'Gliese', 'Wolf', 'Barnard', 'Ross', 'Luyten', 'Tau Ceti', 'Epsilon Eridani', 'Sirius', 'Vega', 'Altair', 'Fomalhaut', 'Pollux', 'Arcturus', 'Aldebaran', 'Regulus', 'Betelgeuse'];
const planetNamePool = [
	'Aurora Prime', 'Cinderfall', 'Dawnreach', 'Ember Hollow', 'Frostline', 'Galeheart', 'Harborlight', 'Ironveil',
	'Juniper Ridge', 'Larkspur', 'Moonwell', 'Northwind', 'Obsidian Bay', 'Pinewatch', 'Quartz Point', 'Ravenrock',
	'Sunspire', 'Tidebreak', 'Umber Coast', 'Valehaven', 'Westforge', 'Zephyr Plains', 'Ashenfield', 'Brightwater',
	'Copper Sky', 'Deepmere', 'Evershore', 'Flint Harbor', 'Goldreach', 'Highgrove', 'Ivory Dunes', 'Jade Crossing',
	'Kestrel Run', 'Lowtide', 'Mistwood', 'New Arcadia', 'Oakpoint', 'Port Meridian', 'Quiet Shoals', 'Redhaven',
	'Stonewake', 'Thornfield', 'Unity', 'Verdant Reach', 'Whitecliff', 'Yarrow', 'Zenith', 'Argent Delta',
	'Blue Mesa', 'Crimson Flats', 'Driftmark', 'Eastwatch', 'Fairwind', 'Graywater', 'Hollow Crown', 'Isleforge',
	'Jetstream', 'Kingsfall', 'Longview', 'Mariner\'s Rest', 'Noble Arch', 'Old Harbor', 'Prospect', 'Ridgefall',
	'Starfield', 'Timberline', 'Uplands', 'Vanguard', 'Windrest', 'Youngspire', 'Zero Point'
];

function toPlanetNameKey(name) {
	return String(name || '').trim().toLowerCase();
}

function getUsedPlanetNames() {
	const used = new Set();
	game.planets.forEach(planet => used.add(toPlanetNameKey(planet.name)));
	game.probes.discoveredPlanets.forEach(planet => used.add(toPlanetNameKey(planet.name)));
	used.delete('');
	return used;
}

function isLegacyPlanetName(name) {
	const trimmed = String(name || '').trim();
	if (!trimmed) return false;
	return legacyPlanetNameBases.some(base => trimmed.startsWith(base + ' '));
}

function generateFallbackPlanetName(usedNames) {
	let n = Math.max(2, game.planets.length + game.probes.discoveredPlanets.length + 1);
	let candidate = `Frontier ${n}`;
	while (usedNames.has(toPlanetNameKey(candidate))) {
		n++;
		candidate = `Frontier ${n}`;
	}
	return candidate;
}

function createUniquePlanetName(usedNames) {
	const available = planetNamePool.filter(name => !usedNames.has(toPlanetNameKey(name)));
	if (available.length > 0) {
		return available[Math.floor(Math.random() * available.length)];
	}
	return generateFallbackPlanetName(usedNames);
}

function generatePlanetName() {
	const used = getUsedPlanetNames();
	return createUniquePlanetName(used);
}

function migratePlanetNames() {
	const used = new Set();

	function migrateOne(entry) {
		const original = String(entry.name || '').trim();
		const originalKey = toPlanetNameKey(original);

		// Keep Earth stable and keep custom/non-legacy names unless duplicated.
		if (originalKey === 'earth' && !used.has(originalKey)) {
			entry.name = 'Earth';
			used.add('earth');
			return;
		}

		let next = original;
		let nextKey = originalKey;
		if (!next || isLegacyPlanetName(next) || used.has(nextKey)) {
			next = createUniquePlanetName(used);
			nextKey = toPlanetNameKey(next);
		}

		entry.name = next;
		used.add(nextKey);
	}

	game.planets.forEach(migrateOne);
	game.probes.discoveredPlanets.forEach(migrateOne);
}

// Colonization milestones: 500K * 3^n
function getColonizationMilestone(n) {
	// Dampened exponent: grows like 1.5^n early, flattens at high n
	const effectiveN = n / (1 + n * 0.005);
	return 500000 * Math.pow(1.5, effectiveN);
}
function canColonizeNext() {
	const milestone = getColonizationMilestone(game.colonizationCount);
	return game.totalBalls >= milestone;
}

function colonizePlanet(discoveredIndex, role) {
	if (!canColonizeNext()) return;
	const disc = game.probes.discoveredPlanets[discoveredIndex];
	const eff = getEffects();
	const prebuilt = eff.terraformCount;
	const newPlanet = {
		id: disc.id, name: disc.name, role: role,
		crude: 0, monomers: 0, polymer: 0, compound: 0, finishedRubber: 0, rubber: 0,
		rubberBuildings: { extractor: prebuilt, cracker: prebuilt, reactor: prebuilt, mixer: prebuilt, press: prebuilt, forming: prebuilt },
		ballBuildings: { basicFactory: prebuilt, advancedFactory: 0, sentientHive: 0, cityOfFactories: 0, dysonFoundry: 0, cosmicHarvester: 0 }
	};
	// Specialized planets only get relevant buildings from terraforming
	if (role === 'rubber') {
		Object.keys(newPlanet.ballBuildings).forEach(k => newPlanet.ballBuildings[k] = 0);
	} else if (role === 'ball') {
		Object.keys(newPlanet.rubberBuildings).forEach(k => newPlanet.rubberBuildings[k] = 0);
	}
	game.planets.push(newPlanet);
	game.probes.discoveredPlanets.splice(discoveredIndex, 1);
	game.colonizationCount++;
	showToast(`${disc.name} Colonized!`, `Role: ${role}. Your empire grows!`);
	saveGame();
	updateDisplay(true);
	checkAchievements();
}

function launchProbe() {
	if (game.probes.launched) return;
	if (game.balls < 500000) {
		announcePolite('Not enough balls. Need 500K to launch a Von Neumann probe.');
		return;
	}
	game.balls -= 500000;
	game.probes.launched = true;
	game.probes.travelProgress = 0;
	saveGame();
	showToast('Von Neumann Probe Launched!', 'Traveling to the nearest star system...');
}

function processProbes(dt) {
	if (!game.probes.launched) return;
	const pe = getPrestigeEffects();
	const eff = getEffects();

	// Travel phase
	if (!game.probes.arrived) {
		game.probes.travelProgress += dt / (game.probes.travelDuration * pe.travelMult * eff.probeTravelMult);
		if (game.probes.travelProgress >= 1) {
			game.probes.travelProgress = 1;
			game.probes.arrived = true;
			game.probes.replicationTimer = 0;
			game.probes.replicationCycle = 0;
			showToast('Probe Arrived!', 'Self-replication beginning. Planets will be discovered soon.');
		}
		return;
	}

	// Replication phase - discover planets
	const baseCycle = 60 * eff.replicationBaseMult;
	const cycleDuration = baseCycle * Math.pow(eff.replicationScale, game.probes.replicationCycle);
	game.probes.replicationTimer += dt;
	if (game.probes.replicationTimer >= cycleDuration) {
		game.probes.replicationTimer -= cycleDuration;
		game.probes.replicationCycle++;
		// Discover planets: base 1, +1 from replicationDouble, +N from probeDiscoverBonus
		const count = (eff.replicationDouble ? 2 : 1) + eff.probeDiscoverBonus;
		for (let i = 0; i < count; i++) {
			if (game.probes.discoveredPlanets.length >= 20) break;
			const newName = generatePlanetName();
			game.probes.discoveredPlanets.push({
				id: `planet_${Date.now()}_${i}`,
				name: newName
			});
		}
	}
}

// ===== SHIPPING & CONSTRUCTION PROBES =====
const SHIPPING_BASE_COST = 1000;
const SHIPPING_COST_MULT = 1.15;
const SHIPPING_RATE = 5;
const CONSTRUCTION_BASE_COST = 5000;
const CONSTRUCTION_COST_MULT = 1.15;
const CONSTRUCTION_BUILD_TIME = 30;
const CONSTRUCTION_DISCOUNT = 0.1; // Probes pay 10% of building cost

// ===== COSMIC & PRESTIGE =====
const CELESTIAL_TIERS = [
	{ name: 'Bouncy Moon', threshold: 1e13, key: 'moons', resetKey: null },
	{ name: 'Bouncy Planet', threshold: 1e16, key: 'planets', resetKey: 'moons' },
	{ name: 'Bouncy Star', threshold: 1e19, key: 'stars', resetKey: 'planets' },
	{ name: 'Giant Bouncy Star', threshold: 1e22, key: 'giantStars', resetKey: 'stars' },
	{ name: 'Bouncy Black Hole', threshold: 1e25, key: 'blackHoles', resetKey: 'giantStars' },
	{ name: 'Supermassive Bouncy Black Hole', threshold: 1e28, key: 'supermassiveBlackHoles', resetKey: 'blackHoles' },
	{ name: 'Bouncy Galaxy', threshold: 1e31, key: 'galaxies', resetKey: 'supermassiveBlackHoles' },
	{ name: 'Bouncy Great Attractor', threshold: 1e34, key: 'greatAttractors', resetKey: 'galaxies' },
	{ name: 'Singularity', threshold: 1e37, key: null, resetKey: 'greatAttractors' }
];
const SINGULARITIES_TO_WIN = 10;

function getCosmicMultiplier() {
	const tierMult = Math.pow(2, game.cosmic.currentTier);
	// Each celestial body gives 1.01x production
	let bodyMult = 1;
	Object.values(game.celestialBodies).forEach(count => {
		if (count > 0) bodyMult *= Math.pow(1.01, count);
	});
	return tierMult * bodyMult;
}

function checkCosmicTiers() {
	const pe = getPrestigeEffects();
	let changed = true;
	while (changed) {
		changed = false;
		// First: advance to the next tier if threshold met
		while (game.cosmic.currentTier < CELESTIAL_TIERS.length &&
			   game.totalBalls >= CELESTIAL_TIERS[game.cosmic.currentTier].threshold * pe.cosmicThresholdMult) {
			const tier = CELESTIAL_TIERS[game.cosmic.currentTier];
			game.cosmic.currentTier++;
			changed = true;
			if (tier.key) {
				game.celestialBodies[tier.key]++;
				showToast(`${tier.name} Tier Reached!`, `New celestial tier unlocked!`);
			} else {
				showToast(`${tier.name} Reached!`, `${getCosmicMultiplier()}x production multiplier!`);
			}
			if (tier.resetKey) {
				game.celestialBodies[tier.resetKey] = 0;
			}
		}
		// Then: within the current tier, award extra bodies for each
		// additional multiple of the tier's threshold
		if (game.cosmic.currentTier > 0 && game.cosmic.currentTier < CELESTIAL_TIERS.length) {
			const prevTier = CELESTIAL_TIERS[game.cosmic.currentTier - 1];
			if (prevTier.key) {
				const threshold = prevTier.threshold * pe.cosmicThresholdMult;
				const earned = Math.floor(game.totalBalls / threshold);
				const current = game.celestialBodies[prevTier.key];
				if (earned > current) {
					const gain = earned - current;
					game.celestialBodies[prevTier.key] = earned;
					// Silent — celestial bodies panel shows live count
					changed = true;
				}
			}
		}
	}
}

function calculateSpPreview() {
	const runTime = (Date.now() - game.prestige.runStartTime) / 1000;
	let base = 1 + Math.floor(game.cosmic.currentTier / 2);
	let speedBonus = 0;
	if (runTime < game.prestige.bestTime) {
		speedBonus = Math.min(10, Math.floor(game.prestige.bestTime / runTime));
	}
	return { base, speedBonus, total: base + speedBonus, runTime };
}

function performPrestigeReset() {
	if (game.cosmic.currentTier < CELESTIAL_TIERS.length) return;
	if (game.sandbox) return;

	// Calculate SP earned
	const runTime = (Date.now() - game.prestige.runStartTime) / 1000;
	let spEarned = 1 + Math.floor(game.cosmic.currentTier / 2);
	if (runTime < game.prestige.bestTime) {
		spEarned += Math.min(10, Math.floor(game.prestige.bestTime / runTime));
		game.prestige.bestTime = runTime;
	} else if (game.prestige.bestTime === Infinity) {
		game.prestige.bestTime = runTime;
	}

	game.prestige.singularityCount++;
	game.prestige.singularityPoints += spEarned;
	game.prestige.totalBallsAllTime += game.totalBalls;
	game.prestige.runStartTime = Date.now();

	showToast(`Universe Collapsed!`, `+${spEarned} Singularity Points. Total: ${game.prestige.singularityPoints} SP`);

	// Check win condition
	if (game.prestige.singularityCount >= SINGULARITIES_TO_WIN) {
		triggerVictory();
		return;
	}

	// Reset everything except prestige tree and achievements
	// Reset all non-prestige upgrades (prestige tree is in game.prestige.upgrades, not here)
	Object.keys(game.upgrades).forEach(key => {
		game.upgrades[key].purchased = false;
	});

	game.balls = 0;
	game.totalBalls = 0;
	game.rubber = 0;
	game.automationOnline = false;
	game.rubberShortageWarned = false;

	game.planets = [{
		id: 'earth', name: 'Earth', role: 'hybrid',
		crude: 0, monomers: 0, polymer: 0, compound: 0, finishedRubber: 0, rubber: 0,
		rubberBuildings: { extractor: 0, cracker: 0, reactor: 0, mixer: 0, press: 0, forming: 0 },
		ballBuildings: { basicFactory: 0, advancedFactory: 0, sentientHive: 0, cityOfFactories: 0, dysonFoundry: 0, cosmicHarvester: 0 }
	}];

	game.probes = {
		launched: false, travelProgress: 0, travelDuration: 60,
		arrived: false, replicationTimer: 0, replicationCycle: 0, discoveredPlanets: []
	};
	game.colonizationCount = 0;
	game.shippingProbes = { count: getPrestigeEffects().freeShipping };
	game.constructionProbes = { count: 0, assignments: [], totalBuilt: 0 };
	game.cosmic = { currentTier: 0 };
	game.celestialBodies = { moons: 0, planets: 0, stars: 0, giantStars: 0, blackHoles: 0, supermassiveBlackHoles: 0, galaxies: 0, greatAttractors: 0 };
	game.celestialStructures = { lunarQuarry: 0, planetaryCoreTap: 0, stellarForge: 0, nebulaCollector: 0, accretionDiskHarvester: 0, hawkingRadiationConverter: 0, darkMatterConverter: 0, cosmicStringResonator: 0 };

	// Re-hide progressive panels
	game.seen = {};
	['#rubber-panel', '#production-panel', '#upgrades-panel', '#planets-panel',
	 '#logistics-panel', '#cosmic-panel', '#prestige-panel',
	 '#stat-bps', '#stat-rubber', '#stat-rps', '#stat-planets'].forEach(sel => {
		const el = document.querySelector(sel);
		if (el) el.style.display = 'none';
	});

	selectedPlanetIndex = 0;
	ballProductionRatio = 0;
	lastShippingRate = 0;

	// Rebuild DOM containers
	['rubber-buildings-container', 'ball-buildings-container', 'supply-chain-display',
	 'production-status', 'upgrades-container', 'upgrade-tabs', 'planets-container', 'logistics-container',
	 'cosmic-container', 'celestial-structures-container', 'prestige-container'].forEach(id => {
		const el = document.getElementById(id);
		if (el) { el.innerHTML = ''; delete el.dataset.built; delete el.dataset.planetKey; delete el.dataset.tabKey; delete el.dataset.builtCount; delete el.dataset.state; delete el.dataset.catKey; delete el.dataset.sortKey; }
	});

	checkMilestones();
	updateDisplay(true);
	renderAchievements();
	saveGame();
	announcePolite('The universe has been reborn. Your prestige bonuses persist.');
}

function triggerVictory() {
	if (gameLoopInterval) clearInterval(gameLoopInterval);
	if (saveInterval) clearInterval(saveInterval);
	window.removeEventListener('beforeunload', saveGame);
	document.body.innerHTML = '';
	document.body.style.margin = '0';
	document.body.style.minHeight = '100vh';
	document.body.style.display = 'flex';
	document.body.style.alignItems = 'center';
	document.body.style.justifyContent = 'center';
	document.body.style.background = 'var(--color-bg-primary)';
	document.body.style.color = 'var(--color-text-primary)';
	document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
	const message = document.createElement('div');
	message.style.textAlign = 'center';
	message.style.maxWidth = '700px';
	message.style.padding = '40px';
	message.style.border = '2px solid var(--color-border)';
	message.style.borderRadius = '16px';
	message.style.background = 'var(--color-bg-secondary)';
	const heading = document.createElement('h1');
	heading.textContent = 'Colossal Singularity';
	heading.style.color = 'var(--color-accent)';
	heading.style.marginBottom = '20px';
	const text = document.createElement('p');
	text.textContent = 'time stands still... or perhaps doesn\'t exist anymore at all...';
	text.style.fontSize = '1.2rem';
	text.style.color = 'var(--color-text-secondary)';
	message.appendChild(heading);
	message.appendChild(text);
	document.body.appendChild(message);
}

function enterSandboxMode() {
	game.sandbox = true;
	document.getElementById('victory-overlay').style.display = 'none';
	showToast('Sandbox Mode', 'Keep playing with all your prestige bonuses. No more win triggers.');
	saveGame();
}

function buyPrestigeUpgrade(branch) {
	const costs = { production: [1,2,4,8,15], efficiency: [2,5,10], logistics: [1,3,7], discovery: [3,8], cosmic: [5,12] };
	const level = game.prestige.upgrades[branch];
	const branchCosts = costs[branch];
	if (level >= branchCosts.length) return;
	const cost = branchCosts[level];
	if (game.prestige.singularityPoints >= cost) {
		game.prestige.singularityPoints -= cost;
		game.prestige.upgrades[branch]++;
		showToast('Prestige Upgrade!', `${branch} level ${game.prestige.upgrades[branch]}`);
		saveGame();
		updateDisplay(true);
	} else {
		announcePolite(`Need ${cost} SP, you have ${game.prestige.singularityPoints}.`);
	}
}

function getPrestigeEffects() {
	const p = game.prestige.upgrades;
	const prodBonuses = [0.2, 0.5, 1.0, 2.5, 5.0];
	let prodMult = 1;
	for (let i = 0; i < p.production; i++) prodMult += prodBonuses[i];

	const effBonuses = [0.02, 0.02, 0.02];
	let costScaleReduction = 0;
	for (let i = 0; i < p.efficiency; i++) costScaleReduction += effBonuses[i];

	const logBonuses = [1, 3, 10];
	let freeShipping = 0;
	for (let i = 0; i < p.logistics; i++) freeShipping = logBonuses[i];

	let travelMult = 1;
	if (p.discovery >= 1) travelMult *= 0.5;
	if (p.discovery >= 2) travelMult *= 0.5;

	let cosmicThresholdMult = 1;
	if (p.cosmic >= 1) cosmicThresholdMult *= 0.75;
	if (p.cosmic >= 2) cosmicThresholdMult *= 0.667;

	return { prodMult, costScaleReduction, freeShipping, travelMult, cosmicThresholdMult };
}

function buyShippingProbe() {
	const eff = getEffects();
	const baseCost = Math.floor(SHIPPING_BASE_COST * eff.shippingCostMult);
	const cost = getCost(baseCost, game.shippingProbes.count, SHIPPING_COST_MULT);
	if (game.balls >= cost) {
		game.balls -= cost;
		game.shippingProbes.count++;
		showToast('Shipping Probe Built!', `Fleet size: ${game.shippingProbes.count}`);
		updateDisplay(true);
	} else {
		announcePolite(`Not enough balls. Need ${formatNumber(cost)}.`);
	}
}

function buyConstructionProbe() {
	const cost = getCost(CONSTRUCTION_BASE_COST, game.constructionProbes.count, CONSTRUCTION_COST_MULT);
	if (game.balls >= cost) {
		game.balls -= cost;
		game.constructionProbes.count++;
		showToast('Construction Probe Built!', `Count: ${game.constructionProbes.count}`);
		updateDisplay(true);
	} else {
		announcePolite(`Not enough balls. Need ${formatNumber(cost)}.`);
	}
}

function processShipping(dt) {
	lastShippingRate = 0;
	shippingPerPlanet = game.planets.map(() => ({ incoming: 0, outgoing: 0 }));
	if (game.shippingProbes.count <= 0) return;
	const eff = getEffects();
	const fleetCapacity = eff.shippingInstant ? Infinity : game.shippingProbes.count * SHIPPING_RATE * eff.shippingCapMult;

	const planetData = game.planets.map(planet => {
		const rb = planet.rubberBuildings;
		const isRubber = planet.role === 'rubber';
		const rubberRoleBonus = isRubber ? (1.5 + eff.specialBonus) : 1;
		function sr(stage) {
			return (1 + (eff.chainSpeed[stage] || 0)) * (eff.bulkSize[stage] || 1) * eff.rubberMult * rubberRoleBonus;
		}
		const stages = Object.keys(rubberBuildingData);
		const stageRates = stages.map(s => rb[s] * sr(s));
		const positiveRates = stageRates.filter(r => r > 0);
		let productionRate = positiveRates.length === stages.length ? Math.min(...positiveRates) : 0;
		let consumptionRate = 0;
		Object.keys(planet.ballBuildings).forEach(key => {
			consumptionRate += planet.ballBuildings[key] * ballBuildingData[key].rubberPerSec * eff.rubberUseMult;
		});
		const netRate = productionRate - consumptionRate;
		return { planet, surplusRate: Math.max(0, netRate), deficitRate: Math.max(0, -netRate) };
	});

	const totalSurplusRate = planetData.reduce((sum, pd) => sum + pd.surplusRate, 0);
	const totalDeficitRate = planetData.reduce((sum, pd) => sum + pd.deficitRate, 0);

	if (totalSurplusRate <= 0 || totalDeficitRate <= 0) {
		if (eff.autoSellRatio > 0 && totalSurplusRate > 0) {
			const sellRate = Math.min(totalSurplusRate, fleetCapacity);
			const sellAmount = sellRate * dt;
			planetData.forEach(pd => {
				if (pd.surplusRate <= 0) return;
				const share = pd.surplusRate / totalSurplusRate;
				const deduct = Math.min(sellAmount * share, pd.planet.rubber);
				pd.planet.rubber -= deduct;
				game.balls += deduct / eff.autoSellRatio;
				game.totalBalls += deduct / eff.autoSellRatio;
			});
		}
		return;
	}

	const actualRate = Math.min(totalDeficitRate, fleetCapacity);
	let actualAmount = actualRate * dt;

	let availableRubber = 0;
	planetData.forEach(pd => {
		if (pd.surplusRate > 0) availableRubber += pd.planet.rubber;
	});
	actualAmount = Math.min(actualAmount, availableRubber);
	if (actualAmount <= 0) return;

	lastShippingRate = actualAmount / dt;

	let totalDeducted = 0;
	planetData.forEach((pd, i) => {
		if (pd.surplusRate <= 0 || availableRubber <= 0) return;
		const share = pd.planet.rubber / availableRubber;
		const deduct = Math.min(actualAmount * share, pd.planet.rubber);
		pd.planet.rubber -= deduct;
		totalDeducted += deduct;
		shippingPerPlanet[i].outgoing = (deduct / dt);
	});

	planetData.forEach((pd, i) => {
		if (pd.deficitRate <= 0) return;
		const share = pd.deficitRate / totalDeficitRate;
		const received = totalDeducted * share;
		pd.planet.rubber += received;
		shippingPerPlanet[i].incoming = (received / dt);
	});

	if (eff.autoSellRatio > 0) {
		const remainingCapacity = Math.max(0, fleetCapacity - actualRate);
		const excessSurplus = Math.max(0, totalSurplusRate - actualRate);
		if (remainingCapacity > 0 && excessSurplus > 0) {
			const sellRate = Math.min(excessSurplus, remainingCapacity);
			const sellAmount = sellRate * dt;
			planetData.forEach(pd => {
				if (pd.surplusRate <= 0) return;
				const share = pd.surplusRate / totalSurplusRate;
				const deduct = Math.min(sellAmount * share, pd.planet.rubber);
				pd.planet.rubber -= deduct;
				game.balls += deduct / eff.autoSellRatio;
				game.totalBalls += deduct / eff.autoSellRatio;
			});
		}
	}
}

function processConstruction(dt) {
	if (game.constructionProbes.count <= 0 || game.constructionProbes.paused) return;
	const eff = getEffects();
	const pe = getPrestigeEffects();
	const maxConcurrent = game.constructionProbes.count * eff.buildParallel;
	const accelFactor = eff.buildAccel ? Math.max(0.1, Math.pow(0.99, game.constructionProbes.totalBuilt)) : 1;
	const buildTime = CONSTRUCTION_BUILD_TIME * eff.buildTimeMult * accelFactor;

	while (game.constructionProbes.assignments.length < maxConcurrent) {
		const task = findNextBuildTask(eff);
		if (!task) break;
		game.constructionProbes.assignments.push({ ...task, timer: 0, waitTime: 0 });
	}

	const completed = [];
	game.constructionProbes.assignments.forEach((task, i) => {
		const taskBuildTime = task.type === 'celestial' ? buildTime * 7 : buildTime;
		task.timer += dt;
		if (task.timer >= taskBuildTime) {
			// Celestial structure task
			if (task.type === 'celestial') {
				const data = celestialStructureData[task.key];
				const cost = Math.floor(getCost(data.baseCost, game.celestialStructures[task.key], data.costMult) * CONSTRUCTION_DISCOUNT);
				if (game.balls >= cost) {
					game.balls -= cost;
					game.celestialStructures[task.key]++;
					game.constructionProbes.totalBuilt++;
					completed.push(i);
				} else {
					task.waitTime = (task.waitTime || 0) + dt;
					if (task.waitTime > 10) completed.push(i);
				}
				task.timer = Math.min(task.timer, taskBuildTime);
				return;
			}
			// Planet building task
			const planet = game.planets[task.planetIndex];
			if (!planet) { completed.push(i); return; }
			let data, costScale;
			if (task.type === 'rubber') {
				data = rubberBuildingData[task.key];
				costScale = Math.max(1.01, data.costMult - (eff.costScaleReduction[task.key] || 0) - pe.costScaleReduction);
			} else {
				data = ballBuildingData[task.key];
				costScale = Math.max(1.01, data.costMult - pe.costScaleReduction);
			}
			const buildCap = planet.role === 'hybrid' ? 25 + eff.hybridCapAdd : 200;
			const currentCount = task.type === 'rubber' ? planet.rubberBuildings[task.key] : planet.ballBuildings[task.key];
			if (currentCount >= buildCap) {
				completed.push(i);
				return;
			}
			// Batch-build: buy as many as affordable up to cap (probes pay 10% cost)
			const maxToCap = buildCap - currentCount;
			const discountBudget = game.balls / (eff.costMult * CONSTRUCTION_DISCOUNT);
			const affordable = getMaxAffordable(data.baseCost, currentCount, costScale, discountBudget);
			const batchCount = Math.min(affordable.count, maxToCap);
			if (batchCount > 0) {
				const totalCost = Math.floor(getBulkCost(data.baseCost, currentCount, costScale, batchCount) * eff.costMult * CONSTRUCTION_DISCOUNT);
				game.balls -= totalCost;
				if (task.type === 'rubber') planet.rubberBuildings[task.key] += batchCount;
				else planet.ballBuildings[task.key] += batchCount;
				game.constructionProbes.totalBuilt += batchCount;
				completed.push(i);
			} else {
				task.waitTime = (task.waitTime || 0) + dt;
				if (task.waitTime > 10) {
					completed.push(i);
				}
			}
			task.timer = Math.min(task.timer, taskBuildTime);
		}
	});

	for (let i = completed.length - 1; i >= 0; i--) {
		game.constructionProbes.assignments.splice(completed[i], 1);
	}
}

function findNextBuildTask(eff) {
	// Count pending assignments per planet per building
	const pending = {};
	game.constructionProbes.assignments.forEach(a => {
		const k = `${a.planetIndex}:${a.type}:${a.key}`;
		pending[k] = (pending[k] || 0) + 1;
	});
	function getPending(pi, type, key) {
		return pending[`${pi}:${type}:${key}`] || 0;
	}

	// Cost ceiling: don't build if cost exceeds 120 seconds of ball production
	const pe = getPrestigeEffects();
	const costCeiling = 120 * currentBps;

	function rubberBuildCost(key, effective) {
		const data = rubberBuildingData[key];
		const costScale = Math.max(1.01, data.costMult - (eff.costScaleReduction[key] || 0) - pe.costScaleReduction);
		return Math.floor(getCost(data.baseCost, effective, costScale) * eff.costMult);
	}
	function ballBuildCost(key, effective) {
		const data = ballBuildingData[key];
		const ballCostScale = Math.max(1.01, data.costMult - pe.costScaleReduction);
		return Math.floor(getCost(data.baseCost, effective, ballCostScale) * eff.costMult);
	}
	function underCeiling(cost) {
		return costCeiling <= 0 || cost <= costCeiling;
	}

	// Try each planet in order of fewest buildings, skip fully-capped planets
	const planetsByBuildings = game.planets.map((planet, index) => {
		let total = 0;
		Object.keys(planet.rubberBuildings).forEach(k => total += planet.rubberBuildings[k] + getPending(index, 'rubber', k));
		Object.keys(planet.ballBuildings).forEach(k => total += planet.ballBuildings[k] + getPending(index, 'ball', k));
		return { planet, index, total };
	}).sort((a, b) => a.total - b.total);

	for (const { planet, index: bestIndex } of planetsByBuildings) {
	const cap = planet.role === 'hybrid' ? 25 + eff.hybridCapAdd : 200;

	if (planet.role === 'rubber') {
		// Rubber world: build the stage with the fewest effective buildings
		let minStage = null, minCount = Infinity;
		Object.keys(rubberBuildingData).forEach(key => {
			if (game.totalBalls < rubberBuildingData[key].unlockAt) return;
			const effective = planet.rubberBuildings[key] + getPending(bestIndex, 'rubber', key);
			if (effective < cap && effective < minCount && underCeiling(rubberBuildCost(key, effective))) {
				minCount = effective;
				minStage = key;
			}
		});
		if (minStage) return { planetIndex: bestIndex, type: 'rubber', key: minStage };
	} else if (planet.role === 'ball') {
		// Ball world: build cheapest unlocked ball building under ceiling
		let bestKey = null, bestCost = Infinity;
		Object.keys(ballBuildingData).forEach(key => {
			if (game.totalBalls < ballBuildingData[key].unlockAt) return;
			if (key === 'cosmicHarvester' && game.totalBalls < 5e9) return;
			const effective = planet.ballBuildings[key] + getPending(bestIndex, 'ball', key);
			if (effective >= cap) return;
			const cost = ballBuildCost(key, effective);
			if (cost < bestCost && underCeiling(cost)) { bestCost = cost; bestKey = key; }
		});
		if (bestKey) return { planetIndex: bestIndex, type: 'ball', key: bestKey };
	} else {
		// Hybrid: count effective buildings including pending
		const effRb = {};
		let totalRb = 0, hasIncompleteChain = false;
		Object.keys(rubberBuildingData).forEach(key => {
			effRb[key] = planet.rubberBuildings[key] + getPending(bestIndex, 'rubber', key);
			totalRb += effRb[key];
			if (game.totalBalls >= rubberBuildingData[key].unlockAt && effRb[key] === 0) {
				hasIncompleteChain = true;
			}
		});
		let totalBb = 0;
		Object.keys(ballBuildingData).forEach(key => {
			totalBb += planet.ballBuildings[key] + getPending(bestIndex, 'ball', key);
		});

		// Priority 1: Complete the rubber chain (at least 1 of each unlocked stage)
		// Priority 2: Balance rubber vs ball building counts
		if (hasIncompleteChain || totalRb <= totalBb) {
			let minStage = null, minCount = Infinity;
			Object.keys(rubberBuildingData).forEach(key => {
				if (game.totalBalls < rubberBuildingData[key].unlockAt) return;
				if (effRb[key] < cap && effRb[key] < minCount && underCeiling(rubberBuildCost(key, effRb[key]))) {
					minCount = effRb[key]; minStage = key;
				}
			});
			if (minStage) return { planetIndex: bestIndex, type: 'rubber', key: minStage };
		}

		// Build ball buildings (cheapest, respecting cap with pending)
		let bestKey = null, bestCost = Infinity;
		Object.keys(ballBuildingData).forEach(key => {
			if (game.totalBalls < ballBuildingData[key].unlockAt) return;
			if (key === 'cosmicHarvester' && game.totalBalls < 5e9) return;
			const effective = planet.ballBuildings[key] + getPending(bestIndex, 'ball', key);
			if (effective < cap) {
				const cost = ballBuildCost(key, effective);
				if (cost < bestCost && underCeiling(cost)) { bestCost = cost; bestKey = key; }
			}
		});
		if (bestKey) return { planetIndex: bestIndex, type: 'ball', key: bestKey };

		// Fallback: more rubber
		let minStage = null, minCount = Infinity;
		Object.keys(rubberBuildingData).forEach(key => {
			if (game.totalBalls < rubberBuildingData[key].unlockAt) return;
			if (effRb[key] < cap && effRb[key] < minCount && underCeiling(rubberBuildCost(key, effRb[key]))) {
				minCount = effRb[key]; minStage = key;
			}
		});
		if (minStage) return { planetIndex: bestIndex, type: 'rubber', key: minStage };
	}
	} // end for loop over planets

	// Fallback: try building cheapest affordable celestial structure
	let bestCelestialKey = null, bestCelestialCost = Infinity;
	Object.keys(celestialStructureData).forEach(key => {
		const data = celestialStructureData[key];
		if (game.cosmic.currentTier < data.tier) return;
		const effective = game.celestialStructures[key] + getPending(-1, 'celestial', key);
		const cost = getCost(data.baseCost, effective, data.costMult);
		if (cost < bestCelestialCost && underCeiling(cost)) {
			bestCelestialCost = cost;
			bestCelestialKey = key;
		}
	});
	if (bestCelestialKey) return { planetIndex: -1, type: 'celestial', key: bestCelestialKey };

	return null;
}

let lastTickTime = Date.now();
function gameLoop() {
	_currentFrame++;
	const now = Date.now();
	let elapsed = (now - lastTickTime) / 1000; // seconds since last tick
	lastTickTime = now;
	// Cap catch-up to 1 hour to avoid freeze on very long absences
	elapsed = Math.min(elapsed, 3600);
	// Process in chunks of 0.1s for accuracy
	while (elapsed > 0) {
		const dt = Math.min(elapsed, 0.1);
		elapsed -= dt;
		gameTick(dt);
	}
	updateDisplay();
	// Throttle milestone/achievement checks to once per second
	if (_currentFrame % 10 === 0) {
		checkMilestones();
		checkAchievements();
	}
}

function gameTick(dt) {
	const eff = getEffects();

	let totalActualBalls = 0;
	let totalTheoreticalBalls = 0;

	// Process each planet's supply chain independently
	game.planets.forEach(planet => {
		const rb = planet.rubberBuildings;
		const isRubber = planet.role === 'rubber';
		const isBall = planet.role === 'ball';
		const rubberRoleBonus = isRubber ? (1.5 + eff.specialBonus) : 1;
		const ballRoleBonus = isBall ? (1.5 + eff.specialBonus) : 1;

		function sr(stage) {
			return (1 + (eff.chainSpeed[stage] || 0)) * (eff.bulkSize[stage] || 1) * eff.rubberMult * rubberRoleBonus;
		}

		// Rubber supply chain (per planet)
		planet.crude += rb.extractor * sr('extractor') * dt;

		const crackAmt = Math.min(rb.cracker * sr('cracker') * dt, planet.crude);
		planet.crude -= crackAmt; planet.monomers += crackAmt;

		const reactAmt = Math.min(rb.reactor * sr('reactor') * dt, planet.monomers);
		planet.monomers -= reactAmt; planet.polymer += reactAmt;

		const mixAmt = Math.min(rb.mixer * sr('mixer') * dt, planet.polymer);
		planet.polymer -= mixAmt; planet.compound += mixAmt;

		const pressAmt = Math.min(rb.press * sr('press') * dt, planet.compound);
		planet.compound -= pressAmt; planet.finishedRubber += pressAmt;

		const formAmt = Math.min(rb.forming * sr('forming') * dt, planet.finishedRubber);
		planet.finishedRubber -= formAmt; planet.rubber += formAmt;

		// Ball production (per planet, consumes local rubber)
		// Split into rubber-dependent and rubber-free production
		let planetRubberDemand = 0;
		let planetRubberBallProd = 0;
		let planetFreeBallProd = 0;
		Object.keys(planet.ballBuildings).forEach(key => {
			const count = planet.ballBuildings[key];
			if (count <= 0) return;
			const data = ballBuildingData[key];
			const factoryMult = (1 + (eff.factorySpeed[key] || 0)) * ballRoleBonus;
			const ballOutput = count * data.ballsPerSec * factoryMult * dt * eff.ballMult;
			if (data.rubberPerSec > 0) {
				planetRubberDemand += count * data.rubberPerSec * eff.rubberUseMult * dt;
				planetRubberBallProd += ballOutput;
			} else {
				planetFreeBallProd += ballOutput;
			}
		});

		totalTheoreticalBalls += planetRubberBallProd + planetFreeBallProd;

		// Rubber-free buildings always produce at full rate
		if (planetFreeBallProd > 0) {
			game.balls += planetFreeBallProd;
			game.totalBalls += planetFreeBallProd;
			totalActualBalls += planetFreeBallProd;
		}

		// Rubber-dependent buildings scale with available rubber
		if (planetRubberDemand > 0 && planet.rubber > 0) {
			const actual = Math.min(planetRubberDemand, planet.rubber);
			const ratio = actual / planetRubberDemand;
			planet.rubber -= actual;
			const produced = planetRubberBallProd * ratio;
			game.balls += produced;
			game.totalBalls += produced;
			totalActualBalls += produced;
		}
	});

	// Celestial structure production (no rubber needed)
	let celestialBallProd = 0;
	Object.keys(celestialStructureData).forEach(key => {
		const count = game.celestialStructures[key];
		if (count <= 0) return;
		const data = celestialStructureData[key];
		const output = count * data.ballsPerSec * eff.celestialStructMult * eff.ballMult * dt;
		celestialBallProd += output;
	});
	if (celestialBallProd > 0) {
		game.balls += celestialBallProd;
		game.totalBalls += celestialBallProd;
		totalActualBalls += celestialBallProd;
		totalTheoreticalBalls += celestialBallProd;
	}

	ballProductionRatio = totalTheoreticalBalls > 0 ? totalActualBalls / totalTheoreticalBalls : 0;
	currentBps = (totalTheoreticalBalls / dt) * ballProductionRatio + eff.autoCollect;

	// Auto-collect
	if (eff.autoCollect > 0) {
		game.balls += eff.autoCollect * dt;
		game.totalBalls += eff.autoCollect * dt;
	}

	// Automation status messages
	const hasBallBuildings = getTotalBallBuildings() > 0;
	if (hasBallBuildings && ballProductionRatio > 0 && !game.automationOnline) {
		game.automationOnline = true;
		announcePolite('Rubber online. Automated ball production activated.');
	}
	if (hasBallBuildings && ballProductionRatio === 0 && game.automationOnline && !game.rubberShortageWarned) {
		announceAssertive('Rubber depleted. Build more rubber infrastructure.');
		game.rubberShortageWarned = true;
	}
	if (ballProductionRatio > 0) game.rubberShortageWarned = false;

	// Update global rubber display (sum of all planets)
	game.rubber = game.planets.reduce((sum, p) => sum + p.rubber, 0);

	// Process Von Neumann probes
	processProbes(dt);

	// Process shipping and construction
	processShipping(dt);
	processConstruction(dt);

	checkCosmicTiers();
}

const UI_FAST_INTERVAL = 120;
const UI_FULL_INTERVAL = 800;
let lastFastUi = 0;
let lastFullUi = 0;

function isPanelActive(id) {
	const panel = document.getElementById(id);
	if (!panel || panel.style.display === 'none') return false;
	return !(game.panelStates && game.panelStates[id] === false);
}

// Display functions
function updateDisplay(forceFull) {
	if (selectedPlanetIndex >= game.planets.length) selectedPlanetIndex = 0;

	const now = performance.now();
	const force = forceFull === true;
	const doFast = force || now - lastFastUi >= UI_FAST_INTERVAL;
	if (!doFast) return;
	lastFastUi = now;

	const eff = getEffects();
	const clickAmount = Math.floor((1 + eff.clickAdd) * eff.cosmicClickMult);
	const collectBtn = document.getElementById('collect-btn');
	const clickLabel = `Bounce to collect ${formatNumber(clickAmount)} ball${clickAmount === 1 ? '' : 's'} manually`;
	collectBtn.textContent = `🎾 ${clickLabel}`;
	collectBtn.setAttribute('aria-label', clickLabel);
	const ballBuildings = getAllBallBuildings();
	const rubberBuildings = getAllRubberBuildings();

	// BPS: rubber-dependent scaled by production ratio, rubber-free always at full rate
	let rubberDepBps = 0;
	let rubberFreeBps = 0;
	Object.keys(ballBuildings).forEach(key => {
		const factoryMult = 1 + (eff.factorySpeed[key] || 0);
		const rate = ballBuildings[key] * ballBuildingData[key].ballsPerSec * factoryMult * eff.ballMult;
		if (ballBuildingData[key].rubberPerSec > 0) {
			rubberDepBps += rate;
		} else {
			rubberFreeBps += rate;
		}
	});
	// Celestial structure BPS
	let celestialBps = 0;
	Object.keys(celestialStructureData).forEach(key => {
		const count = game.celestialStructures[key];
		if (count > 0) celestialBps += count * celestialStructureData[key].ballsPerSec * eff.celestialStructMult * eff.ballMult;
	});
	const bps = rubberDepBps * ballProductionRatio + rubberFreeBps + eff.autoCollect + celestialBps;

	// RPS: sum of each planet's bottleneck-limited throughput
	let rps = 0;
	game.planets.forEach(planet => {
		const isRubber = planet.role === 'rubber';
		const rubberRoleBonus = isRubber ? (1.5 + eff.specialBonus) : 1;
		const planetStageRates = Object.keys(rubberBuildingData).map(stage => {
			return planet.rubberBuildings[stage] * (1 + (eff.chainSpeed[stage] || 0)) * (eff.bulkSize[stage] || 1) * eff.rubberMult * rubberRoleBonus;
		});
		rps += Math.min(...planetStageRates);
	});
	let rubberDemand = 0;
	game.planets.forEach(planet => {
		Object.keys(planet.ballBuildings).forEach(key => {
			rubberDemand += planet.ballBuildings[key] * ballBuildingData[key].rubberPerSec * eff.rubberUseMult;
		});
	});

	document.getElementById('ball-count').textContent = formatNumber(game.balls);
	document.getElementById('bps-display').textContent = formatNumber(bps);
	const selectedPlanet = game.planets[selectedPlanetIndex];
	document.getElementById('rubber-count').textContent = formatNumber(selectedPlanet ? selectedPlanet.rubber : 0) +
		(game.planets.length > 1 ? ` (total: ${formatNumber(game.rubber)})` : '');
	document.getElementById('rps-display').textContent = formatNumber(rps);
	const synergyPlanets = Math.max(0, game.planets.length - 5);
	const synergyText = synergyPlanets > 0 ? ` (synergy: ${(1 + synergyPlanets * 0.25).toFixed(2)}x)` : '';
	const empireText = eff.empireMomentum > 1 ? ` (empire: ${eff.empireMomentum.toFixed(2)}x)` : '';
	document.getElementById('planet-count').textContent = `${game.planets.length} colonized` +
		(game.probes.discoveredPlanets.length > 0 ? ` / ${game.probes.discoveredPlanets.length} discovered` : '') +
		synergyText + empireText;
	const hasRubberWorld = game.planets.some(planet => planet.role === 'rubber');
	const hasBallWorld = game.planets.some(planet => planet.role === 'ball');
	const hasHybridWorld = game.planets.some(planet => planet.role === 'hybrid');
	const rubberFlowStat = document.getElementById('stat-rubber-flow');
	if (rubberFlowStat) {
		rubberFlowStat.style.display = hasRubberWorld && (hasBallWorld || hasHybridWorld) ? '' : 'none';
		const rubberFlow = document.getElementById('rubber-flow-display');
		if (rubberFlow) {
			rubberFlow.textContent = `Supply ${formatNumber(rps)}/s | Demand ${formatNumber(rubberDemand)}/s`;
		}
	}

	updateNextStage();

	// Sell rubber button visibility
	const sellContainer = document.getElementById('sell-rubber-container');
	if (sellContainer && isPanelActive('rubber-panel')) {
		const showSell = game.totalBalls < 100000 || getTotalBallBuildings() === 0;
		sellContainer.style.display = showSell ? '' : 'none';
		const sellBtn = document.getElementById('sell-rubber-btn');
		if (sellBtn) {
			const planet = game.planets[selectedPlanetIndex];
			const rubberAmount = planet ? planet.rubber : 0;
			sellBtn.disabled = rubberAmount <= 0;
			sellBtn.textContent = rubberAmount > 0 ? `Sell ${formatNumber(rubberAmount)} rubber for ${formatNumber(Math.floor(rubberAmount * 5))} balls` : 'No rubber to sell';
		}
	}

	const doFull = force || now - lastFullUi >= UI_FULL_INTERVAL;
	if (!doFull) return;
	lastFullUi = now;

	renderPlanetSelector();
	if (isPanelActive('rubber-panel')) {
		renderSupplyChain();
		renderRubberBuildings();
	}
	if (isPanelActive('production-panel')) {
		renderBallBuildings();
		renderProductionStatus();
	}
	if (isPanelActive('upgrades-panel')) {
		renderUpgrades();
	}
	if (isPanelActive('planets-panel')) {
		renderPlanets();
	}
	if (isPanelActive('logistics-panel')) {
		renderLogistics();
	}
	if (isPanelActive('cosmic-panel')) {
		renderCosmic();
	}
	if (isPanelActive('prestige-panel')) {
		renderPrestige();
	}
}

function renderSupplyChain() {
	const container = document.getElementById('supply-chain-display');
	const planet = game.planets[selectedPlanetIndex];
	const eff = getEffects();
	const rb = planet.rubberBuildings;
	const isRubber = planet.role === 'rubber';
	const rubberRoleBonus = isRubber ? (1.5 + eff.specialBonus) : 1;

	function sr(stage) { return (1 + (eff.chainSpeed[stage] || 0)) * (eff.bulkSize[stage] || 1) * eff.rubberMult * rubberRoleBonus; }

	let totalRubberDemand = 0;
	Object.keys(planet.ballBuildings).forEach(key => {
		totalRubberDemand += planet.ballBuildings[key] * ballBuildingData[key].rubberPerSec * eff.rubberUseMult;
	});

	const steps = [
		{ id: 'crude', name: 'Crude Oil', value: planet.crude, supply: rb.extractor * sr('extractor'), demand: rb.cracker * sr('cracker'), unlockAt: 200 },
		{ id: 'monomers', name: 'Monomers', value: planet.monomers, supply: rb.cracker * sr('cracker'), demand: rb.reactor * sr('reactor'), unlockAt: 1000 },
		{ id: 'polymer', name: 'Polymer', value: planet.polymer, supply: rb.reactor * sr('reactor'), demand: rb.mixer * sr('mixer'), unlockAt: 2500 },
		{ id: 'compound', name: 'Compound', value: planet.compound, supply: rb.mixer * sr('mixer'), demand: rb.press * sr('press'), unlockAt: 5000 },
		{ id: 'finished', name: 'Finished', value: planet.finishedRubber, supply: rb.press * sr('press'), demand: rb.forming * sr('forming'), unlockAt: 10000 },
		{ id: 'rubber', name: 'Rubber', value: planet.rubber, supply: rb.forming * sr('forming'), demand: totalRubberDemand, unlockAt: 25000 }
	];

	// Build once
	if (container.children.length === 0) {
		steps.forEach(step => {
			const div = document.createElement('div');
			div.className = 'chain-step';

			const nameDiv = document.createElement('div');
			nameDiv.className = 'chain-step-name';
			nameDiv.textContent = step.name;
			div.appendChild(nameDiv);

			const valueDiv = document.createElement('div');
			valueDiv.className = 'chain-step-value';
			valueDiv.id = `chain-value-${step.id}`;
			div.appendChild(valueDiv);

			const ratesDiv = document.createElement('div');
			ratesDiv.className = 'chain-step-rates';

			const supplySpan = document.createElement('span');
			supplySpan.className = 'rate-supply';
			supplySpan.id = `chain-supply-${step.id}`;
			ratesDiv.appendChild(supplySpan);

			const demandSpan = document.createElement('span');
			demandSpan.className = 'rate-demand';
			demandSpan.id = `chain-demand-${step.id}`;
			ratesDiv.appendChild(demandSpan);

			div.appendChild(ratesDiv);
			container.appendChild(div);
		});
	}

	// Update values in place (with progressive visibility)
	steps.forEach(step => {
		const stepDiv = document.getElementById(`chain-value-${step.id}`);
		if (!stepDiv) return;
		const parentDiv = stepDiv.parentElement;
		const unlocked = game.totalBalls >= step.unlockAt || step.value > 0 || step.supply > 0 || step.demand > 0;
		parentDiv.style.display = unlocked ? '' : 'none';
		if (!unlocked) return;

		stepDiv.textContent = formatNumber(step.value);

		const supplySpan = document.getElementById(`chain-supply-${step.id}`);
		if (supplySpan) supplySpan.textContent = `+${formatNumber(step.supply)}/s, `;

		const demandSpan = document.getElementById(`chain-demand-${step.id}`);
		if (demandSpan) demandSpan.textContent = `-${formatNumber(step.demand)}/s`;
	});
}

function renderRubberBuildings() {
	const container = document.getElementById('rubber-buildings-container');
	const planet = game.planets[selectedPlanetIndex];

	// Force rebuild if planet or role changed
	const currentKey = `${selectedPlanetIndex}:${planet.role}`;
	if (container.dataset.planetKey !== currentKey) {
		container.innerHTML = '';
		container.dataset.planetKey = currentKey;
	}

	// Ball worlds can't build rubber infrastructure
	if (planet.role === 'ball') {
		if (container.children.length === 0) {
			const msg = document.createElement('p');
			msg.style.color = 'var(--color-text-secondary)';
			msg.textContent = 'This is a Ball World. Switch to a Rubber World or Hybrid planet to build rubber infrastructure.';
			container.appendChild(msg);
		}
		return;
	}

	// Build initial structure if empty
	if (container.children.length === 0) {
		Object.keys(rubberBuildingData).forEach(key => {
			const data = rubberBuildingData[key];

			const div = document.createElement('div');
			div.className = 'building-item';
			div.id = `rubber-building-${key}`;

			const header = document.createElement('div');
			header.className = 'item-header';

			const nameSpan = document.createElement('span');
			nameSpan.className = 'item-name';
			nameSpan.textContent = data.name;
			header.appendChild(nameSpan);

			const countSpan = document.createElement('span');
			countSpan.className = 'item-count';
			countSpan.id = `rubber-count-${key}`;
			header.appendChild(countSpan);

			div.appendChild(header);

			const desc = document.createElement('p');
			desc.className = 'item-description';
			desc.textContent = data.description;
			div.appendChild(desc);

			const stats = document.createElement('div');
			stats.className = 'item-stats';

			const produceSpan = document.createElement('span');
			produceSpan.textContent = `Produces: ${data.produces}`;
			stats.appendChild(produceSpan);

			if (data.consumes) {
				const consumeSpan = document.createElement('span');
				consumeSpan.textContent = `Consumes: ${data.consumes}`;
				stats.appendChild(consumeSpan);
			}

			const rateSpan = document.createElement('span');
			rateSpan.textContent = `Rate: ${data.rate}/sec`;
			stats.appendChild(rateSpan);

			div.appendChild(stats);

			const btn = document.createElement('button');
			btn.className = 'btn';
			btn.id = `rubber-btn-${key}`;
			btn.addEventListener('click', () => buyRubberBuilding(selectedPlanetIndex, key));
			div.appendChild(btn);

			container.appendChild(div);
		});
	}

	// Update dynamic parts (visibility + costs)
	const eff = getEffects();
	Object.keys(rubberBuildingData).forEach(key => {
		const data = rubberBuildingData[key];
		const div = document.getElementById(`rubber-building-${key}`);
		if (!div) return;

		// Progressive unlock: hide buildings not yet unlocked
		const unlocked = game.totalBalls >= data.unlockAt || planet.rubberBuildings[key] > 0;
		div.style.display = unlocked ? 'block' : 'none';
		if (!unlocked) return;

		const count = planet.rubberBuildings[key];
		const pe = getPrestigeEffects();
		const costScale = Math.max(1.01, data.costMult - (eff.costScaleReduction[key] || 0) - pe.costScaleReduction);
		const cap = planet.role === 'hybrid' ? 25 + eff.hybridCapAdd : 200;
		const remaining = cap - count;
		const atCap = remaining <= 0;

		let displayAmount = 1;
		let displayCost = 0;
		if (!atCap) {
			if (buyAmount === 'max') {
				const maxInfo = getMaxAffordable(data.baseCost, count, costScale, game.balls / eff.costMult);
				displayAmount = Math.min(maxInfo.count, remaining);
				if (displayAmount <= 0) displayAmount = 1;
			} else {
				displayAmount = Math.min(buyAmount, remaining);
				if (displayAmount <= 0) displayAmount = 1;
			}
			displayCost = Math.floor(getBulkCost(data.baseCost, count, costScale, displayAmount) * eff.costMult);
		}
		const canAfford = !atCap && game.balls >= displayCost;

		const countSpan = document.getElementById(`rubber-count-${key}`);
		if (countSpan) countSpan.textContent = `Owned: ${count}` + (atCap ? ` (cap ${cap})` : '');

		const btn = document.getElementById(`rubber-btn-${key}`);
		if (btn) {
			btn.disabled = !canAfford;
			let label;
			if (atCap) {
				label = `${data.name}, cap reached (${cap})`;
			} else {
				const purchaseName = displayAmount > 1 ? `${data.name} x${displayAmount}` : data.name;
				label = buildBallPurchaseButtonLabel(purchaseName, displayCost);
			}
			btn.setAttribute('aria-label', `${label}. Currently owned: ${count}`);
			btn.textContent = label;
		}
	});
}

function renderBallBuildings() {
	const container = document.getElementById('ball-buildings-container');
	const planet = game.planets[selectedPlanetIndex];

	// Force rebuild if planet or role changed
	const currentKey = `${selectedPlanetIndex}:${planet.role}`;
	if (container.dataset.planetKey !== currentKey) {
		container.innerHTML = '';
		container.dataset.planetKey = currentKey;
	}

	// Rubber worlds can't build ball factories
	if (planet.role === 'rubber') {
		if (container.children.length === 0) {
			const msg = document.createElement('p');
			msg.style.color = 'var(--color-text-secondary)';
			msg.textContent = 'This is a Rubber World. Switch to a Ball World or Hybrid planet to build ball factories.';
			container.appendChild(msg);
		}
		return;
	}

	// Build initial structure if empty
	if (container.children.length === 0) {
		Object.keys(ballBuildingData).forEach(key => {
			const data = ballBuildingData[key];

			const div = document.createElement('div');
			div.className = 'building-item';
			div.id = `ball-building-${key}`;

			const header = document.createElement('div');
			header.className = 'item-header';

			const nameSpan = document.createElement('span');
			nameSpan.className = 'item-name';
			nameSpan.textContent = data.name;
			header.appendChild(nameSpan);

			const countSpan = document.createElement('span');
			countSpan.className = 'item-count';
			countSpan.id = `ball-count-${key}`;
			header.appendChild(countSpan);

			div.appendChild(header);

			const desc = document.createElement('p');
			desc.className = 'item-description';
			desc.textContent = data.description;
			div.appendChild(desc);

			const stats = document.createElement('div');
			stats.className = 'item-stats';
			stats.id = `ball-stats-${key}`;

			const ballsSpan = document.createElement('span');
			ballsSpan.id = `ball-stat-balls-${key}`;
			stats.appendChild(ballsSpan);

			const rubberSpan = document.createElement('span');
			rubberSpan.id = `ball-stat-rubber-${key}`;
			stats.appendChild(rubberSpan);

			const totalSpan = document.createElement('span');
			totalSpan.id = `ball-stat-total-${key}`;
			stats.appendChild(totalSpan);

			div.appendChild(stats);

			const btn = document.createElement('button');
			btn.className = 'btn';
			btn.id = `ball-btn-${key}`;
			btn.addEventListener('click', () => buyBallBuilding(selectedPlanetIndex, key));
			div.appendChild(btn);

			container.appendChild(div);
		});
	}

	// Update dynamic parts (visibility + costs)
	const eff = getEffects();
	const pe = getPrestigeEffects();
	Object.keys(ballBuildingData).forEach(key => {
		const data = ballBuildingData[key];
		const div = document.getElementById(`ball-building-${key}`);
		if (!div) return;

		// Progressive unlock: hide buildings not yet unlocked
		const unlocked = (game.totalBalls >= data.unlockAt || planet.ballBuildings[key] > 0) &&
			(key !== 'cosmicHarvester' || game.cosmic.currentTier >= 2);
		div.style.display = unlocked ? 'block' : 'none';
		if (!unlocked) return;

		const count = planet.ballBuildings[key];
		const factoryMult = 1 + (eff.factorySpeed[key] || 0);
		const costScale = Math.max(1.01, data.costMult - pe.costScaleReduction);
		const ballCap = planet.role === 'hybrid' ? 25 + eff.hybridCapAdd : 200;
		const ballRemaining = ballCap - count;
		const bAtCap = ballRemaining <= 0;

		let bDisplayAmount = 1;
		let bDisplayCost = 0;
		if (!bAtCap) {
			if (buyAmount === 'max') {
				const maxInfo = getMaxAffordable(data.baseCost, count, costScale, game.balls / eff.costMult);
				bDisplayAmount = Math.min(maxInfo.count, ballRemaining);
				if (bDisplayAmount <= 0) bDisplayAmount = 1;
			} else {
				bDisplayAmount = Math.min(buyAmount, ballRemaining);
				if (bDisplayAmount <= 0) bDisplayAmount = 1;
			}
			bDisplayCost = Math.floor(getBulkCost(data.baseCost, count, costScale, bDisplayAmount) * eff.costMult);
		}
		const canAfford = !bAtCap && game.balls >= bDisplayCost;

		const countSpan = document.getElementById(`ball-count-${key}`);
		if (countSpan) countSpan.textContent = `Owned: ${count}` + (bAtCap ? ` (cap ${ballCap})` : '');

		const ballsSpan = document.getElementById(`ball-stat-balls-${key}`);
		if (ballsSpan) ballsSpan.textContent = `Balls: ${formatNumber(data.ballsPerSec * factoryMult * eff.ballMult)}/sec`;

		const rubberSpan = document.getElementById(`ball-stat-rubber-${key}`);
		if (rubberSpan) rubberSpan.textContent = `Rubber: ${formatNumber(data.rubberPerSec * eff.rubberUseMult)}/sec`;

		const totalSpan = document.getElementById(`ball-stat-total-${key}`);
		if (totalSpan) totalSpan.textContent = `Total: ${formatNumber(count * data.ballsPerSec * factoryMult * eff.ballMult)}/sec`;

		const btn = document.getElementById(`ball-btn-${key}`);
		if (btn) {
			btn.disabled = !canAfford;
			let bLabel;
			if (bAtCap) {
				bLabel = `${data.name}, cap reached (${ballCap})`;
			} else {
				const purchaseName = bDisplayAmount > 1 ? `${data.name} x${bDisplayAmount}` : data.name;
				bLabel = buildBallPurchaseButtonLabel(purchaseName, bDisplayCost);
			}
			btn.setAttribute('aria-label', `${bLabel}. Currently owned: ${count}`);
			btn.textContent = bLabel;
		}
	});
}

function renderProductionStatus() {
	const container = document.getElementById('production-status');
	const planet = game.planets[selectedPlanetIndex];
	const eff = getEffects();
	const isRubber = planet.role === 'rubber';
	const rubberRoleBonus = isRubber ? (1.5 + eff.specialBonus) : 1;

	let totalRubberDemand = 0;
	let freeballBps = 0;
	const isBall = planet.role === 'ball';
	const ballRoleBonus = isBall ? (1.5 + eff.specialBonus) : 1;
	Object.keys(planet.ballBuildings).forEach(key => {
		const count = planet.ballBuildings[key];
		if (count <= 0) return;
		const data = ballBuildingData[key];
		if (data.rubberPerSec > 0) {
			totalRubberDemand += count * data.rubberPerSec * eff.rubberUseMult;
		} else {
			const factoryMult = (1 + (eff.factorySpeed[key] || 0)) * ballRoleBonus;
			freeballBps += count * data.ballsPerSec * factoryMult * eff.ballMult;
		}
	});

	const formingRate = (1 + (eff.chainSpeed.forming || 0)) * (eff.bulkSize.forming || 1) * eff.rubberMult * rubberRoleBonus;
	const localSupply = planet.rubberBuildings.forming * formingRate;
	const shippedIn = shippingPerPlanet[selectedPlanetIndex] ? shippingPerPlanet[selectedPlanetIndex].incoming : 0;
	const rubberSupply = localSupply + shippedIn;
	const totalBallBuildings = Object.values(planet.ballBuildings).reduce((a,b) => a+b, 0);

	// Build once
	if (!container.dataset.built) {
		container.dataset.built = 'true';
		const msg = document.createElement('div');
		msg.id = 'production-status-msg';
		container.appendChild(msg);
	}

	const msg = document.getElementById('production-status-msg');
	if (!msg) return;

	const supplyBreakdown = shippedIn > 0
		? `Supply: ${formatNumber(rubberSupply)}/sec (${formatNumber(localSupply)} local + ${formatNumber(shippedIn)} shipped)`
		: `Supply: ${formatNumber(rubberSupply)}/sec`;
	const freeballNote = freeballBps > 0 ? ` Cosmic Harvesters: +${formatNumber(freeballBps)} balls/sec (no rubber needed).` : '';

	if (totalRubberDemand === 0 && totalBallBuildings === 0) {
		msg.className = '';
		msg.style.color = 'var(--color-text-secondary)';
		if (planet.role === 'ball') {
			msg.textContent = `Rubber ${supplyBreakdown}, Demand: 0/sec. This Ball World needs factories and shipping probes to deliver rubber from other planets.`;
		} else {
			msg.textContent = `Rubber ${supplyBreakdown}, Demand: 0/sec. Build factories to start automated production!`;
		}
	} else if (totalRubberDemand === 0 && freeballBps > 0) {
		msg.className = 'success-message';
		msg.style.color = '';
		msg.textContent = `\u2713${freeballNote}`;
	} else if (rubberSupply >= totalRubberDemand) {
		msg.className = 'success-message';
		msg.style.color = '';
		msg.textContent = `\u2713 Automation active. ${supplyBreakdown}, Demand: ${formatNumber(totalRubberDemand)}/sec.${freeballNote}`;
	} else {
		msg.className = 'warning-message';
		msg.style.color = '';
		const ratio = Math.floor(rubberSupply / totalRubberDemand * 100);
		const shippingHint = planet.role === 'ball' && localSupply === 0 && shippedIn === 0 && game.shippingProbes.count === 0
			? ' Build shipping probes to deliver rubber here!' : '';
		msg.textContent = `\u26A0 Rubber shortage! ${supplyBreakdown}, Demand: ${formatNumber(totalRubberDemand)}/sec. Running at ${ratio}% capacity.${shippingHint}${freeballNote}`;
	}
}

function renderUpgrades() {
	const container = document.getElementById('upgrades-container');

	// Build DOM elements once
	if (!container.dataset.built) {
		container.dataset.built = 'true';

		Object.keys(upgradeData).forEach(key => {
			const data = upgradeData[key];
			if (data.autoGrant || data.currency === 'sp') return;

			const div = document.createElement('div');
			div.className = 'upgrade-item';
			div.id = `upgrade-item-${key}`;
			div.dataset.category = data.category || '';
			div.style.display = 'none';

			const catDiv = document.createElement('div');
			catDiv.className = 'upgrade-category';
			catDiv.textContent = data.category || '';
			div.appendChild(catDiv);

			const header = document.createElement('div');
			header.className = 'item-header';
			const nameSpan = document.createElement('span');
			nameSpan.className = 'item-name';
			nameSpan.textContent = data.name;
			header.appendChild(nameSpan);
			div.appendChild(header);

			const desc = document.createElement('p');
			desc.className = 'item-description';
			desc.textContent = data.description;
			div.appendChild(desc);

			const btn = document.createElement('button');
			btn.className = 'btn';
			btn.id = `upgrade-btn-${key}`;
			btn.addEventListener('click', () => buyUpgrade(key));
			div.appendChild(btn);

			container.appendChild(div);
		});
	}

	// Collect visible upgrades and per-category counts
	const visibleKeys = [];
	const categoryCounts = {};
	const categoryAffordable = {};
	Object.keys(upgradeData).forEach(key => {
		const data = upgradeData[key];
		if (data.autoGrant || data.currency === 'sp') return;
		const div = document.getElementById(`upgrade-item-${key}`);
		if (!div) return;

		const purchased = game.upgrades[key] && game.upgrades[key].purchased;
		let unlocked = false;
		try { unlocked = data.unlock && data.unlock(); } catch(e) {}
		const visible = unlocked && !purchased;

		if (visible) {
			visibleKeys.push(key);
			const cat = data.category || '';
			categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
			if (game.balls >= data.cost) {
				categoryAffordable[cat] = (categoryAffordable[cat] || 0) + 1;
			}
		}

		const matchesTab = upgradeTabFilter === 'All' || (data.category || '') === upgradeTabFilter;
		div.style.display = (visible && matchesTab) ? 'block' : 'none';
		if (visible) {
			const btn = document.getElementById(`upgrade-btn-${key}`);
			if (btn) {
				btn.disabled = game.balls < data.cost;
				const label = buildBallPurchaseButtonLabel(data.name, data.cost);
				btn.textContent = label;
				btn.setAttribute('aria-label', label);
			}
		}
	});

	// Sort visible upgrades by price (cheapest first)
	// Only reorder DOM if the order changed (avoids breaking clicks in Firefox)
	visibleKeys.sort((a, b) => upgradeData[a].cost - upgradeData[b].cost);
	const sortKey = visibleKeys.join(',');
	if (container.dataset.sortKey !== sortKey) {
		container.dataset.sortKey = sortKey;
		visibleKeys.forEach(key => {
			const div = document.getElementById(`upgrade-item-${key}`);
			if (div) container.appendChild(div);
		});
	}

	// Render tabs — build once per category set, update badges in place
	const tabContainer = document.getElementById('upgrade-tabs');
	if (tabContainer) {
		const categories = ['All', ...Object.keys(categoryCounts).sort()];
		const catKey = categories.join('|');
		// Only rebuild tab buttons when categories change (new upgrade types unlocked)
		if (tabContainer.dataset.catKey !== catKey) {
			tabContainer.dataset.catKey = catKey;
			tabContainer.innerHTML = '';
			categories.forEach(cat => {
				const btn = document.createElement('button');
				btn.className = 'upgrade-tab-btn';
				btn.setAttribute('role', 'tab');
				btn.setAttribute('aria-label', `Show ${cat} upgrades`);
				btn.dataset.tabCat = cat;
				const textNode = document.createTextNode(cat);
				btn.appendChild(textNode);
				const badge = document.createElement('span');
				badge.className = 'tab-badge';
				badge.style.display = 'none';
				btn.appendChild(badge);
				btn.addEventListener('click', () => {
					upgradeTabFilter = cat;
					updateDisplay(true);
				});
				tabContainer.appendChild(btn);
			});
		}
		// Update active state and badge counts in place
		Array.from(tabContainer.children).forEach(btn => {
			const cat = btn.dataset.tabCat;
			const isActive = upgradeTabFilter === cat;
			btn.className = 'upgrade-tab-btn' + (isActive ? ' active' : '');
			btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
			const affordable = cat === 'All'
				? Object.values(categoryAffordable).reduce((a, b) => a + b, 0)
				: (categoryAffordable[cat] || 0);
			const badge = btn.querySelector('.tab-badge');
			if (badge) {
				if (affordable > 0) {
					badge.textContent = affordable;
					badge.style.display = '';
				} else {
					badge.style.display = 'none';
				}
			}
		});
	}
}

function renderPlanets() {
	const container = document.getElementById('planets-container');
	const eff = getEffects();

	// Build skeleton once — three independent sections
	if (!container.dataset.built) {
		container.dataset.built = 'true';

		const h3 = document.createElement('h3');
		h3.id = 'planets-header';
		container.appendChild(h3);

		const planetList = document.createElement('div');
		planetList.id = 'planet-list';
		container.appendChild(planetList);

		const probeSection = document.createElement('div');
		probeSection.id = 'probe-section';
		container.appendChild(probeSection);

		const discSection = document.createElement('div');
		discSection.id = 'discovered-section';
		discSection.style.display = 'none';
		container.appendChild(discSection);

		const h3disc = document.createElement('h3');
		h3disc.id = 'discovered-header';
		h3disc.style.marginTop = '20px';
		discSection.appendChild(h3disc);

		const mileP = document.createElement('p');
		mileP.id = 'colonization-milestone';
		discSection.appendChild(mileP);

		const discList = document.createElement('div');
		discList.id = 'discovered-list';
		discSection.appendChild(discList);
	}

	// --- Colonized Planets: append new ones only ---
	const planetList = document.getElementById('planet-list');
	const builtPlanetCount = parseInt(planetList.dataset.builtCount || '0', 10);
	document.getElementById('planets-header').textContent = `Colonized Planets (${game.planets.length})`;

	for (let index = builtPlanetCount; index < game.planets.length; index++) {
		const planet = game.planets[index];
		const div = document.createElement('div');
		div.className = 'planet-item';
		div.dataset.planetIdx = index;

		const header = document.createElement('div');
		header.className = 'item-header';
		const nameSpan = document.createElement('span');
		nameSpan.className = 'item-name';
		nameSpan.textContent = planet.name;
		const roleSpan = document.createElement('span');
		roleSpan.className = 'planet-role';
		roleSpan.id = `planet-role-${index}`;
		nameSpan.appendChild(roleSpan);
		header.appendChild(nameSpan);
		div.appendChild(header);

		const stats = document.createElement('div');
		stats.className = 'item-stats';
		const rbSpan = document.createElement('span');
		rbSpan.id = `planet-rb-${index}`;
		stats.appendChild(rbSpan);
		const bbSpan = document.createElement('span');
		bbSpan.id = `planet-bb-${index}`;
		stats.appendChild(bbSpan);
		const rubberSpan = document.createElement('span');
		rubberSpan.id = `planet-rubber-${index}`;
		stats.appendChild(rubberSpan);
		div.appendChild(stats);

		// Role change buttons — create all 3, hide current role
		const roleDiv = document.createElement('div');
		roleDiv.style.display = 'flex'; roleDiv.style.gap = '8px'; roleDiv.style.flexWrap = 'wrap';
		['rubber', 'ball', 'hybrid'].forEach(role => {
			const btn = document.createElement('button');
			btn.className = 'btn btn-small';
			btn.id = `planet-role-btn-${index}-${role}`;
			btn.textContent = role === 'rubber' ? 'Set Rubber World' : role === 'ball' ? 'Set Ball World' : 'Set Hybrid';
			btn.style.display = planet.role === role ? 'none' : '';
			btn.addEventListener('click', () => changePlanetRole(index, role));
			roleDiv.appendChild(btn);
		});
		div.appendChild(roleDiv);
		planetList.appendChild(div);
	}
	planetList.dataset.builtCount = game.planets.length;

	// --- Probe section: rebuild only on state transition ---
	const probeSection = document.getElementById('probe-section');
	const probeState = !game.probes.launched ? 'ready' : !game.probes.arrived ? 'traveling' : 'arrived';
	if (probeSection.dataset.state !== probeState) {
		probeSection.dataset.state = probeState;
		probeSection.innerHTML = '';

		const h3probe = document.createElement('h3');
		h3probe.style.marginTop = '20px';
		h3probe.textContent = 'Von Neumann Probes';
		probeSection.appendChild(h3probe);

		if (!game.probes.launched) {
			const p = document.createElement('p');
			p.style.color = 'var(--color-text-secondary)';
			p.textContent = 'Launch a self-replicating probe to discover new worlds. You only need one - it will copy itself!';
			probeSection.appendChild(p);
			const btn = document.createElement('button');
			btn.className = 'btn';
			btn.id = 'probe-launch-btn';
			const launchLabel = buildBallPurchaseButtonLabel('Launch Von Neumann Probe', 500000);
			btn.textContent = launchLabel;
			btn.setAttribute('aria-label', launchLabel);
			btn.addEventListener('click', launchProbe);
			btn.disabled = game.balls < 500000;
			probeSection.appendChild(btn);
		} else if (!game.probes.arrived) {
			const p = document.createElement('p');
			p.id = 'probe-travel-text';
			p.style.color = 'var(--color-accent)';
			probeSection.appendChild(p);
			const bar = document.createElement('div');
			bar.style.cssText = 'background: var(--color-bg-tertiary); border-radius: 4px; height: 20px; overflow: hidden; margin: 10px 0;';
			const fill = document.createElement('div');
			fill.id = 'probe-travel-fill';
			fill.style.cssText = 'background: var(--color-accent); height: 100%; width: 0%; transition: width 0.1s;';
			bar.appendChild(fill);
			probeSection.appendChild(bar);
		} else {
			const p = document.createElement('p');
			p.id = 'probe-replication-text';
			p.style.color = 'var(--color-success)';
			probeSection.appendChild(p);
		}
	}

	// --- Discovered Planets: rebuild only when list content changes ---
	const discSection = document.getElementById('discovered-section');
	const showDisc = game.probes.discoveredPlanets.length > 0 || game.probes.launched;
	discSection.style.display = showDisc ? '' : 'none';

	if (showDisc) {
		const discKey = game.probes.discoveredPlanets.map(d => d.id).join(',');
		const discList = document.getElementById('discovered-list');
		if (discList.dataset.discKey !== discKey) {
			discList.dataset.discKey = discKey;
			discList.innerHTML = '';
			game.probes.discoveredPlanets.forEach((disc, i) => {
				const div = document.createElement('div');
				div.className = 'planet-item';
				div.id = `disc-planet-${i}`;
				const nameSpan = document.createElement('span');
				nameSpan.className = 'item-name';
				nameSpan.textContent = disc.name + ' (Discovered)';
				div.appendChild(nameSpan);

				const btnDiv = document.createElement('div');
				btnDiv.id = `disc-btns-${i}`;
				btnDiv.style.display = 'flex'; btnDiv.style.gap = '8px'; btnDiv.style.marginTop = '8px'; btnDiv.style.flexWrap = 'wrap';
				['rubber', 'ball', 'hybrid'].forEach(role => {
					const btn = document.createElement('button');
					btn.className = 'btn btn-small';
					btn.textContent = `Colonize as ${role === 'rubber' ? 'Rubber World' : role === 'ball' ? 'Ball World' : 'Hybrid'}`;
					btn.addEventListener('click', () => colonizePlanet(i, role));
					btnDiv.appendChild(btn);
				});
				div.appendChild(btnDiv);
				discList.appendChild(div);
			});
		}

		const discHeader = document.getElementById('discovered-header');
		if (discHeader) discHeader.textContent = `Discovered Planets (${game.probes.discoveredPlanets.length})`;
	}

	// --- Update dynamic content without rebuilding DOM ---
	game.planets.forEach((planet, index) => {
		const roleClass = planet.role === 'rubber' ? 'role-rubber' : planet.role === 'ball' ? 'role-ball' : 'role-hybrid';
		const bonusText = planet.role === 'rubber' ? ` (${(1.5 + eff.specialBonus).toFixed(2)}x rubber, cap: 200)` :
						 planet.role === 'ball' ? ` (${(1.5 + eff.specialBonus).toFixed(2)}x balls, cap: 200)` :
						 ` (cap: ${25 + eff.hybridCapAdd})`;

		const roleSpan = document.getElementById(`planet-role-${index}`);
		if (roleSpan) { roleSpan.className = `planet-role ${roleClass}`; roleSpan.textContent = planet.role + bonusText; }

		// Update role button visibility (handles role changes without rebuild)
		['rubber', 'ball', 'hybrid'].forEach(role => {
			const btn = document.getElementById(`planet-role-btn-${index}-${role}`);
			if (btn) btn.style.display = planet.role === role ? 'none' : '';
		});

		const rbSpan = document.getElementById(`planet-rb-${index}`);
		if (rbSpan) rbSpan.textContent = `Rubber buildings: ${Object.values(planet.rubberBuildings).reduce((a,b) => a+b, 0)}`;

		const bbSpan = document.getElementById(`planet-bb-${index}`);
		if (bbSpan) bbSpan.textContent = `Ball buildings: ${Object.values(planet.ballBuildings).reduce((a,b) => a+b, 0)}`;

		const rubberSpan = document.getElementById(`planet-rubber-${index}`);
		if (rubberSpan) rubberSpan.textContent = `Local rubber: ${formatNumber(planet.rubber)}`;
	});

	// Update probe progress
	const travelText = document.getElementById('probe-travel-text');
	if (travelText) {
		const pct = Math.floor(game.probes.travelProgress * 100);
		travelText.textContent = `Probe in transit... ${pct}%`;
	}
	const travelFill = document.getElementById('probe-travel-fill');
	if (travelFill) travelFill.style.width = Math.floor(game.probes.travelProgress * 100) + '%';

	const repText = document.getElementById('probe-replication-text');
	if (repText) {
		const baseCycle = 60 * eff.replicationBaseMult;
		const cycleDuration = baseCycle * Math.pow(eff.replicationScale, game.probes.replicationCycle);
		const pct = Math.floor((game.probes.replicationTimer / cycleDuration) * 100);
		repText.textContent = `Probes replicating... Next discovery: ${pct}% (cycle ${game.probes.replicationCycle + 1})`;
	}

	// Update colonization milestone
	const mileP = document.getElementById('colonization-milestone');
	if (mileP) {
		const milestone = getColonizationMilestone(game.colonizationCount);
		const canCol = game.totalBalls >= milestone;
		mileP.style.color = canCol ? 'var(--color-success)' : 'var(--color-text-secondary)';
		mileP.textContent = canCol ? 'Milestone reached! You can colonize a planet.' :
			`Next colonization at ${formatNumber(milestone)} total balls (you have ${formatNumber(game.totalBalls)})`;
	}

	// Update discovered planet visibility
	const canCol = game.totalBalls >= getColonizationMilestone(game.colonizationCount);
	game.probes.discoveredPlanets.forEach((disc, i) => {
		const div = document.getElementById(`disc-planet-${i}`);
		if (div) div.style.opacity = canCol ? '1' : '0.6';
		const btns = document.getElementById(`disc-btns-${i}`);
		if (btns) btns.style.display = canCol ? 'flex' : 'none';
	});

	// Update launch button disabled state
	const launchBtn = document.getElementById('probe-launch-btn');
	if (launchBtn) {
		const launchLabel = buildBallPurchaseButtonLabel('Launch Von Neumann Probe', 500000);
		launchBtn.disabled = game.balls < 500000;
		launchBtn.textContent = launchLabel;
		launchBtn.setAttribute('aria-label', launchLabel);
	}
}

function renderLogistics() {
	const container = document.getElementById('logistics-container');
	if (!container) return;
	const eff = getEffects();

	if (!container.dataset.built) {
		container.dataset.built = 'true';

		const shipH3 = document.createElement('h3');
		shipH3.textContent = 'Shipping Fleet';
		container.appendChild(shipH3);

		const shipInfo = document.createElement('p');
		shipInfo.id = 'shipping-info';
		shipInfo.style.color = 'var(--color-text-secondary)';
		container.appendChild(shipInfo);

		const shipFlow = document.createElement('p');
		shipFlow.id = 'shipping-flow';
		container.appendChild(shipFlow);

		const shipBtn = document.createElement('button');
		shipBtn.className = 'btn';
		shipBtn.id = 'buy-shipping-btn';
		shipBtn.addEventListener('click', buyShippingProbe);
		container.appendChild(shipBtn);

		const conH3 = document.createElement('h3');
		conH3.textContent = 'Construction Probes';
		conH3.style.marginTop = '20px';
		container.appendChild(conH3);

		const conInfo = document.createElement('p');
		conInfo.id = 'construction-info';
		conInfo.style.color = 'var(--color-text-secondary)';
		container.appendChild(conInfo);

		const conActivity = document.createElement('div');
		conActivity.id = 'construction-activity';
		const conLabel = document.createElement('p');
		conLabel.id = 'construction-label';
		conLabel.style.marginBottom = '4px';
		conActivity.appendChild(conLabel);
		const conList = document.createElement('ul');
		conList.id = 'construction-list';
		conList.setAttribute('aria-label', 'Construction queue');
		conList.style.cssText = 'margin: 0 0 0 20px; padding: 0; list-style: disc;';
		conActivity.appendChild(conList);
		container.appendChild(conActivity);

		const conCostInfo = document.createElement('p');
		conCostInfo.id = 'construction-cost-info';
		conCostInfo.style.cssText = 'font-size: 0.9em; margin-top: 4px;';
		container.appendChild(conCostInfo);

		const conRemaining = document.createElement('p');
		conRemaining.id = 'construction-remaining';
		conRemaining.style.cssText = 'font-size: 0.9em; margin-top: 4px;';
		container.appendChild(conRemaining);

		const pauseBtn = document.createElement('button');
		pauseBtn.className = 'btn btn-small';
		pauseBtn.id = 'pause-construction-btn';
		pauseBtn.style.marginBottom = '10px';
			pauseBtn.addEventListener('click', () => {
				game.constructionProbes.paused = !game.constructionProbes.paused;
				if (game.constructionProbes.paused) {
					game.constructionProbes.assignments = [];
				}
				updateDisplay(true);
			});
			container.appendChild(pauseBtn);

		const conBtn = document.createElement('button');
		conBtn.className = 'btn';
		conBtn.id = 'buy-construction-btn';
		conBtn.addEventListener('click', buyConstructionProbe);
		container.appendChild(conBtn);
	}

	const fleetCapacity = eff.shippingInstant ? Infinity : game.shippingProbes.count * SHIPPING_RATE * eff.shippingCapMult;
	const shipInfo = document.getElementById('shipping-info');
	if (shipInfo) shipInfo.textContent = eff.shippingInstant
		? `Fleet: ${game.shippingProbes.count} probes | Capacity: Unlimited (Quantum Entanglement)`
		: `Fleet: ${game.shippingProbes.count} probes | Capacity: ${formatNumber(fleetCapacity)} rubber/sec`;

	const shipFlow = document.getElementById('shipping-flow');
	if (shipFlow) {
		if (lastShippingRate > 0) {
			shipFlow.style.color = 'var(--color-success)';
			shipFlow.textContent = `Shipping ${formatNumber(lastShippingRate)} rubber/sec between planets`;
		} else if (game.shippingProbes.count > 0) {
			shipFlow.style.color = 'var(--color-text-secondary)';
			shipFlow.textContent = 'No rubber needs shipping right now.';
		} else {
			shipFlow.style.color = 'var(--color-text-secondary)';
			shipFlow.textContent = 'Build shipping probes to move rubber between planets.';
		}
	}

	const shipCost = getCost(Math.floor(SHIPPING_BASE_COST * eff.shippingCostMult), game.shippingProbes.count, SHIPPING_COST_MULT);
	const shipBtn = document.getElementById('buy-shipping-btn');
	if (shipBtn) {
		shipBtn.disabled = game.balls < shipCost;
		const shipLabel = buildBallPurchaseButtonLabel('Shipping Probe', shipCost);
		shipBtn.textContent = shipLabel;
		shipBtn.setAttribute('aria-label', shipLabel);
	}

	const accelFactor = eff.buildAccel ? Math.max(0.1, Math.pow(0.99, game.constructionProbes.totalBuilt)) : 1;
	const effectiveBuildTime = CONSTRUCTION_BUILD_TIME * eff.buildTimeMult * accelFactor;
	const conInfo = document.getElementById('construction-info');
	if (conInfo) conInfo.textContent = `Probes: ${game.constructionProbes.count} | Build time: ${effectiveBuildTime.toFixed(1)}s | Built: ${game.constructionProbes.totalBuilt}`;

	const pauseBtn = document.getElementById('pause-construction-btn');
	if (pauseBtn) {
		pauseBtn.textContent = game.constructionProbes.paused ? 'Resume Construction' : 'Pause Construction';
		pauseBtn.style.background = game.constructionProbes.paused ? 'var(--color-success)' : 'var(--color-warning)';
		pauseBtn.style.display = game.constructionProbes.count > 0 ? '' : 'none';
	}

	const conActivity = document.getElementById('construction-activity');
	const conCostInfo = document.getElementById('construction-cost-info');
	if (conActivity) {
		const assignments = game.constructionProbes.assignments;
		const conLabel = document.getElementById('construction-label');
		const conList = document.getElementById('construction-list');
		if (game.constructionProbes.paused && game.constructionProbes.count > 0) {
			if (conLabel) { conLabel.style.color = 'var(--color-warning)'; conLabel.textContent = 'Construction paused.'; }
			if (conList) conList.style.display = 'none';
			if (conCostInfo) conCostInfo.textContent = '';
		} else if (assignments.length > 0) {
			const pe = getPrestigeEffects();
			let totalQueuedCosts = 0;
			let activeCount = 0;
			let waitingCount = 0;

			if (conLabel) { conLabel.style.color = 'var(--color-accent)'; conLabel.textContent = `Building (${assignments.length} queued):`; }
			if (conList) {
				conList.style.display = '';
				// Reuse existing <li> elements, add/remove as needed
				while (conList.children.length > assignments.length) conList.removeChild(conList.lastChild);
				while (conList.children.length < assignments.length) {
					const li = document.createElement('li');
					li.style.cssText = 'padding: 2px 0; color: var(--color-accent);';
					conList.appendChild(li);
				}
				assignments.forEach((task, i) => {
					const planet = game.planets[task.planetIndex];
					let bData, taskCost;
					const taskBT = task.type === 'celestial' ? effectiveBuildTime * 7 : effectiveBuildTime;
					if (task.type === 'celestial') {
						bData = celestialStructureData[task.key];
						taskCost = Math.floor(getCost(bData.baseCost, game.celestialStructures[task.key], bData.costMult) * CONSTRUCTION_DISCOUNT);
					} else if (task.type === 'rubber') {
						bData = rubberBuildingData[task.key];
						const costScale = Math.max(1.01, bData.costMult - (eff.costScaleReduction[task.key] || 0) - pe.costScaleReduction);
						taskCost = Math.floor(getCost(bData.baseCost, planet.rubberBuildings[task.key], costScale) * eff.costMult * CONSTRUCTION_DISCOUNT);
					} else {
						bData = ballBuildingData[task.key];
						const ballCostScale = Math.max(1.01, bData.costMult - pe.costScaleReduction);
						taskCost = Math.floor(getCost(bData.baseCost, planet.ballBuildings[task.key], ballCostScale) * eff.costMult * CONSTRUCTION_DISCOUNT);
					}
					totalQueuedCosts += taskCost;
					const pct = Math.min(100, Math.floor((task.timer / taskBT) * 100));
					const waiting = task.timer >= taskBT && game.balls < taskCost;
					if (waiting) waitingCount++; else activeCount++;
					const status = waiting ? `WAITING (need ${formatNumber(taskCost)})` : `${pct}% - next: ${formatNumber(taskCost)}`;
					const name = bData ? bData.name : task.key;
					const pName = task.type === 'celestial' ? 'Celestial' : (planet ? planet.name : '?');
					conList.children[i].textContent = `${name} on ${pName} (${status})`;
				});
			}

			if (conCostInfo) {
				conCostInfo.style.color = 'var(--color-warning)';
				if (waitingCount === assignments.length) {
					conCostInfo.textContent = `All ${waitingCount} probes waiting for funds (${formatNumber(totalQueuedCosts)} total queued)`;
				} else {
					conCostInfo.textContent = `${activeCount} building, ${waitingCount} waiting (${formatNumber(totalQueuedCosts)} total queued)`;
				}
			}
		} else if (game.constructionProbes.count > 0) {
			if (conLabel) { conLabel.style.color = 'var(--color-text-secondary)'; conLabel.textContent = 'Idle - all planets optimized or waiting for funds.'; }
			if (conList) conList.style.display = 'none';
			if (conCostInfo) conCostInfo.textContent = '';
		} else {
			if (conLabel) { conLabel.style.color = 'var(--color-text-secondary)'; conLabel.textContent = 'Build construction probes to automate your empire.'; }
			if (conList) conList.style.display = 'none';
			if (conCostInfo) conCostInfo.textContent = '';
		}
	}

	const conRemaining = document.getElementById('construction-remaining');
	if (conRemaining && game.constructionProbes.count > 0) {
		const rubberTypes = Object.keys(rubberBuildingData).length;
		const ballTypes = Object.keys(ballBuildingData).length;
		const hybridCap = 25 + eff.hybridCapAdd;
		let totalCap = 0;
		let totalBuilt = 0;
		game.planets.forEach(planet => {
			if (planet.role === 'rubber') {
				totalCap += rubberTypes * 200;
			} else if (planet.role === 'ball') {
				totalCap += ballTypes * 200;
			} else {
				totalCap += (rubberTypes + ballTypes) * hybridCap;
			}
			Object.values(planet.rubberBuildings).forEach(c => totalBuilt += c);
			Object.values(planet.ballBuildings).forEach(c => totalBuilt += c);
		});
		const remaining = Math.max(0, totalCap - totalBuilt);
		conRemaining.style.color = remaining > 0 ? 'var(--color-text-secondary)' : 'var(--color-success)';
		conRemaining.textContent = remaining > 0
			? `Buildings remaining: ${formatNumber(remaining)} of ${formatNumber(totalCap)} (${formatNumber(totalBuilt)} built)`
			: `All ${formatNumber(totalCap)} building slots filled across ${game.planets.length} planets.`;
	} else if (conRemaining) {
		conRemaining.textContent = '';
	}

	const conCost = getCost(CONSTRUCTION_BASE_COST, game.constructionProbes.count, CONSTRUCTION_COST_MULT);
	const conBtn = document.getElementById('buy-construction-btn');
	if (conBtn) {
		conBtn.disabled = game.balls < conCost;
		const conLabel = buildBallPurchaseButtonLabel('Construction Probe', conCost);
		conBtn.textContent = conLabel;
		conBtn.setAttribute('aria-label', conLabel);
	}
}

function renderCosmic() {
	const container = document.getElementById('cosmic-container');
	if (!container) return;
	const pe = getPrestigeEffects();
	const eff = getEffects();

	if (!container.dataset.built) {
		container.dataset.built = 'true';

		// Celestial body tier list
		const tierList = document.createElement('ul');
		tierList.id = 'cosmic-tier-list';
		tierList.setAttribute('aria-label', 'Celestial body tiers');
		tierList.style.cssText = 'list-style: none; margin: 0; padding: 0;';
		CELESTIAL_TIERS.forEach((tier, i) => {
			const li = document.createElement('li');
			li.id = `cosmic-tier-${i}`;
			li.style.cssText = 'padding: 10px 15px; margin-bottom: 8px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;';
			const label = document.createElement('span');
			label.id = `cosmic-tier-label-${i}`;
			label.style.fontWeight = '600';
			li.appendChild(label);
			const info = document.createElement('span');
			info.id = `cosmic-tier-info-${i}`;
			info.style.fontSize = '0.9em';
			info.style.color = 'var(--color-text-secondary)';
			li.appendChild(info);
			tierList.appendChild(li);
		});
		container.appendChild(tierList);

		// Celestial structures section
		const structHeader = document.createElement('h3');
		structHeader.textContent = 'Celestial Structures';
		structHeader.style.cssText = 'margin-top: 20px; color: var(--color-accent);';
		container.appendChild(structHeader);

		const structContainer = document.createElement('ul');
		structContainer.id = 'celestial-structures-container';
		structContainer.setAttribute('aria-label', 'Celestial structures');
		structContainer.style.cssText = 'list-style: none; margin: 0; padding: 0;';
		container.appendChild(structContainer);
	}

	// Update tier display in place
	CELESTIAL_TIERS.forEach((tier, i) => {
		const reached = game.cosmic.currentTier > i;
		const threshold = tier.threshold * pe.cosmicThresholdMult;
		const div = document.getElementById(`cosmic-tier-${i}`);
		if (div) {
			div.style.border = `1px solid ${reached ? 'var(--color-success)' : 'var(--color-border)'}`;
			div.style.background = reached ? 'rgba(16,185,129,0.1)' : 'var(--color-bg-tertiary)';
		}
		const label = document.getElementById(`cosmic-tier-label-${i}`);
		if (label) {
			label.style.color = reached ? 'var(--color-success)' : 'var(--color-text-secondary)';
			const bodyCount = tier.key ? game.celestialBodies[tier.key] : 0;
			const bodyText = tier.key && bodyCount > 0 ? ` (${bodyCount})` : '';
			label.textContent = `${reached ? '\u2713' : '\u25CB'} Tier ${i + 1}: ${tier.name}${bodyText}`;
		}
		const info = document.getElementById(`cosmic-tier-info-${i}`);
		if (info) info.textContent = reached ? `${formatNumber(getCosmicMultiplier())}x production` : `${formatNumber(threshold)} balls`;
	});

	// Celestial structures
	const structContainer = document.getElementById('celestial-structures-container');
	if (structContainer) {
		Object.keys(celestialStructureData).forEach(key => {
			const data = celestialStructureData[key];
			const unlocked = game.cosmic.currentTier >= data.tier;
			let row = document.getElementById(`celestial-struct-${key}`);

			if (!row && unlocked) {
				row = document.createElement('li');
				row.id = `celestial-struct-${key}`;
				row.style.cssText = 'padding: 10px 15px; margin-bottom: 8px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-bg-tertiary); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;';

				const leftDiv = document.createElement('div');
				const nameSpan = document.createElement('strong');
				nameSpan.textContent = data.name;
				leftDiv.appendChild(nameSpan);
				const descP = document.createElement('div');
				descP.style.cssText = 'font-size: 0.85em; color: var(--color-text-secondary);';
				descP.textContent = data.description;
				leftDiv.appendChild(descP);
				const statsSpan = document.createElement('div');
				statsSpan.id = `celestial-struct-stats-${key}`;
				statsSpan.style.cssText = 'font-size: 0.85em; color: var(--color-accent);';
				leftDiv.appendChild(statsSpan);
				row.appendChild(leftDiv);

				const buyBtn = document.createElement('button');
				buyBtn.className = 'btn';
				buyBtn.id = `celestial-struct-buy-${key}`;
				buyBtn.style.cssText = 'white-space: nowrap;';
				buyBtn.addEventListener('click', () => buyCelestialStructure(key));
				row.appendChild(buyBtn);

				structContainer.appendChild(row);
			}

			if (row && unlocked) {
				row.style.display = '';
				const count = game.celestialStructures[key];
				const cost = getCost(data.baseCost, count, data.costMult);
				const perUnit = data.ballsPerSec * eff.celestialStructMult * eff.ballMult;
				const totalOutput = count * perUnit;

				const statsSpan = document.getElementById(`celestial-struct-stats-${key}`);
				if (statsSpan) {
					statsSpan.textContent = `Owned: ${count} | ${formatNumber(perUnit)}/s each | Total: ${formatNumber(totalOutput)}/s`;
				}

				const buyBtn = document.getElementById(`celestial-struct-buy-${key}`);
				if (buyBtn) {
					const amt = buyAmount === 'max' ? Math.max(1, getMaxAffordable(data.baseCost, count, data.costMult, game.balls).count) : (buyAmount === 10 ? 10 : 1);
					const bulkCost = buyAmount === 'max' ? getBulkCost(data.baseCost, count, data.costMult, amt) : (amt > 1 ? getBulkCost(data.baseCost, count, data.costMult, amt) : cost);
					const purchaseName = amt > 1 ? `${data.name} x${amt}` : data.name;
					const celestialLabel = buildBallPurchaseButtonLabel(purchaseName, bulkCost);
					buyBtn.textContent = celestialLabel;
					buyBtn.setAttribute('aria-label', celestialLabel);
					buyBtn.disabled = game.balls < bulkCost;
				}
			} else if (row && !unlocked) {
				row.style.display = 'none';
			}
		});
	}

}

function renderPrestige() {
	const container = document.getElementById('prestige-container');
	if (!container) return;

	if (!container.dataset.built) {
		container.dataset.built = 'true';

		const spDisplay = document.createElement('p');
		spDisplay.id = 'sp-display';
		spDisplay.style.cssText = 'font-size: 1.3rem; font-weight: 700; color: var(--color-accent); margin-bottom: 15px;';
		container.appendChild(spDisplay);

		const statsP = document.createElement('p');
		statsP.id = 'prestige-stats';
		statsP.style.cssText = 'color: var(--color-text-secondary); margin-bottom: 15px;';
		container.appendChild(statsP);

		const progressLabel = document.createElement('p');
		progressLabel.id = 'singularity-progress';
		progressLabel.style.cssText = 'font-weight: 600; margin-bottom: 5px;';
		container.appendChild(progressLabel);

		const progressBar = document.createElement('div');
		progressBar.style.cssText = 'background: var(--color-bg-tertiary); border-radius: 4px; height: 20px; overflow: hidden; margin-bottom: 20px;';
		const progressFill = document.createElement('div');
		progressFill.id = 'singularity-progress-fill';
		progressFill.style.cssText = 'background: var(--color-warning); height: 100%; transition: width 0.3s;';
		progressBar.appendChild(progressFill);
		container.appendChild(progressBar);

		const treeH3 = document.createElement('h3');
		treeH3.textContent = 'Prestige Upgrades';
		treeH3.style.marginBottom = '10px';
		container.appendChild(treeH3);

		const treeDiv = document.createElement('div');
		treeDiv.id = 'prestige-tree';
		container.appendChild(treeDiv);
	}

	const showCollapse = game.cosmic.currentTier >= CELESTIAL_TIERS.length && !game.sandbox;
	let spPreview = document.getElementById('sp-preview');
	let collapseBtn = document.getElementById('collapse-btn');
	if (showCollapse) {
		if (!spPreview) {
			spPreview = document.createElement('div');
			spPreview.id = 'sp-preview';
			spPreview.style.cssText = 'margin-top: 15px; padding: 12px 15px; border-radius: 6px; border: 1px solid var(--color-warning); background: rgba(245, 158, 11, 0.1);';
		}
		const preview = calculateSpPreview();
		const runMins = Math.floor(preview.runTime / 60);
		const runSecs = Math.floor(preview.runTime % 60);
		const bestText = game.prestige.bestTime === Infinity ? 'none' : Math.floor(game.prestige.bestTime) + 's';
		let previewText = `Collapse now for ${preview.total} SP (base: ${preview.base}`;
		if (preview.speedBonus > 0) previewText += `, speed bonus: +${preview.speedBonus}`;
		previewText += `)`;
		previewText += `\nRun time: ${runMins}m ${runSecs}s | Best: ${bestText}`;
		if (preview.speedBonus === 0 && game.prestige.bestTime !== Infinity) {
			previewText += ` | Beat your best time for bonus SP!`;
		}
		spPreview.style.whiteSpace = 'pre-line';
		spPreview.style.color = 'var(--color-warning)';
		spPreview.style.fontWeight = '600';
		spPreview.textContent = previewText;

		if (!collapseBtn) {
			collapseBtn = document.createElement('button');
			collapseBtn.id = 'collapse-btn';
			collapseBtn.className = 'btn';
			collapseBtn.style.marginTop = '10px';
			collapseBtn.style.background = 'var(--color-warning)';
			collapseBtn.textContent = 'Collapse Universe (Prestige Reset)';
			collapseBtn.addEventListener('click', () => {
				const p = calculateSpPreview();
				if (confirm(`Collapse the universe for ${p.total} SP? You will lose all balls, buildings, planets, and upgrades. Achievements and prestige upgrades persist.`)) {
					performPrestigeReset();
				}
			});
		}
		const spDisplay = document.getElementById('sp-display');
		if (spDisplay && spPreview.parentElement !== container) {
			container.insertBefore(spPreview, spDisplay);
		}
		if (spDisplay && collapseBtn.parentElement !== container) {
			container.insertBefore(collapseBtn, spDisplay);
		}
		if (spPreview) spPreview.style.display = '';
		if (collapseBtn) collapseBtn.style.display = '';
	} else {
		if (spPreview) spPreview.style.display = 'none';
		if (collapseBtn) collapseBtn.style.display = 'none';
	}

	const spDisplay = document.getElementById('sp-display');
	if (spDisplay) spDisplay.textContent = `Singularity Points: ${game.prestige.singularityPoints} SP`;

	const statsP = document.getElementById('prestige-stats');
	if (statsP) {
		const best = game.prestige.bestTime === Infinity ? 'N/A' : Math.floor(game.prestige.bestTime) + 's';
		statsP.textContent = `Singularities: ${game.prestige.singularityCount} | Fastest run: ${best} | All-time balls: ${formatNumber(game.prestige.totalBallsAllTime + game.totalBalls)}`;
	}

	const progressLabel = document.getElementById('singularity-progress');
	if (progressLabel) progressLabel.textContent = `Colossal Singularity: ${game.prestige.singularityCount} / ${SINGULARITIES_TO_WIN}`;

	const progressFill = document.getElementById('singularity-progress-fill');
	if (progressFill) progressFill.style.width = `${Math.min(100, (game.prestige.singularityCount / SINGULARITIES_TO_WIN) * 100)}%`;

	// Prestige upgrade tree
	const treeDiv = document.getElementById('prestige-tree');
	if (!treeDiv) return;

	const branches = [
		{ key: 'production', name: 'Production', desc: ['Base +20%', '+50%', '+100%', '+250%', '+500%'], costs: [1,2,4,8,15] },
		{ key: 'efficiency', name: 'Efficiency', desc: ['Cost 1.15x\u21921.13x', '\u21921.11x', '\u21921.09x'], costs: [2,5,10] },
		{ key: 'logistics', name: 'Logistics', desc: ['Start +1 ship probe', '+3 probes', '+10 probes'], costs: [1,3,7] },
		{ key: 'discovery', name: 'Discovery', desc: ['Travel time /2', 'Travel time /4'], costs: [3,8] },
		{ key: 'cosmic', name: 'Cosmic', desc: ['Thresholds -25%', '-50%'], costs: [5,12] }
	];

	// Build tree once
	if (!treeDiv.dataset.built) {
		treeDiv.dataset.built = 'true';
		branches.forEach(branch => {
			const div = document.createElement('div');
			div.dataset.branchKey = branch.key;
			div.style.cssText = 'padding: 12px 15px; margin-bottom: 8px; border-radius: 6px; border: 1px solid var(--color-border); background: var(--color-bg-tertiary);';

			const header = document.createElement('div');
			header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;';
			const nameSpan = document.createElement('span');
			nameSpan.style.fontWeight = '600';
			nameSpan.id = `prestige-branch-name-${branch.key}`;
			header.appendChild(nameSpan);
			const maxSpan = document.createElement('span');
			maxSpan.style.color = 'var(--color-success)';
			maxSpan.id = `prestige-branch-max-${branch.key}`;
			header.appendChild(maxSpan);
			div.appendChild(header);

			const descP = document.createElement('p');
			descP.style.cssText = 'font-size: 0.85em; color: var(--color-text-secondary); margin-bottom: 8px;';
			descP.id = `prestige-branch-desc-${branch.key}`;
			div.appendChild(descP);

			const btn = document.createElement('button');
			btn.className = 'btn btn-small';
			btn.id = `prestige-branch-btn-${branch.key}`;
			btn.addEventListener('click', () => buyPrestigeUpgrade(branch.key));
			div.appendChild(btn);

			treeDiv.appendChild(div);
		});
	}

	// Update tree in place
	branches.forEach(branch => {
		const level = game.prestige.upgrades[branch.key];
		const maxed = level >= branch.costs.length;
		const nextCost = maxed ? null : branch.costs[level];

		const nameSpan = document.getElementById(`prestige-branch-name-${branch.key}`);
		if (nameSpan) nameSpan.textContent = `${branch.name} (${level}/${branch.costs.length})`;

		const maxSpan = document.getElementById(`prestige-branch-max-${branch.key}`);
		if (maxSpan) maxSpan.textContent = maxed ? 'MAX' : '';

		const descP = document.getElementById(`prestige-branch-desc-${branch.key}`);
		if (descP) {
			descP.textContent = level > 0 ? `Current: ${branch.desc[level - 1]}` : 'Not purchased';
			if (!maxed) descP.textContent += ` | Next: ${branch.desc[level]}`;
		}

		const btn = document.getElementById(`prestige-branch-btn-${branch.key}`);
		if (btn) {
			btn.style.display = maxed ? 'none' : '';
			if (!maxed) {
				btn.disabled = game.prestige.singularityPoints < nextCost;
				btn.textContent = `Buy (${nextCost} SP)`;
			}
		}
	});
}

function renderAchievements() {
	const container = document.getElementById('achievements-container');

	// Build DOM elements once
	if (!container.dataset.built) {
		container.dataset.built = 'true';

		achievementData.forEach(ach => {
			const div = document.createElement('div');
			div.id = `achievement-${ach.id}`;
			div.className = 'achievement-item achievement-locked';
			div.setAttribute('role', 'article');
			div.setAttribute('aria-label', `Achievement locked: ${ach.name}`);

			const header = document.createElement('div');
			header.className = 'item-header';
			const nameSpan = document.createElement('span');
			nameSpan.className = 'item-name';
			nameSpan.id = `achievement-name-${ach.id}`;
			nameSpan.textContent = `\uD83D\uDD12 ${ach.name}`;
			header.appendChild(nameSpan);
			div.appendChild(header);

			const desc = document.createElement('p');
			desc.className = 'item-description';
			desc.textContent = ach.description;
			div.appendChild(desc);

			container.appendChild(div);
		});
	}

	// Count for tab badges
	const unlockedCount = achievementData.filter(ach => game.achievements[ach.id].unlocked).length;
	const lockedCount = achievementData.length - unlockedCount;

	// Render filter tabs
	const tabContainer = document.getElementById('achievement-tabs');
	if (tabContainer) {
		const tabs = [
			{ key: 'All', label: 'All', count: achievementData.length },
			{ key: 'Unlocked', label: 'Unlocked', count: unlockedCount },
			{ key: 'Locked', label: 'Locked', count: lockedCount }
		];
		if (!tabContainer.dataset.built) {
			tabContainer.dataset.built = 'true';
			tabs.forEach(tab => {
				const btn = document.createElement('button');
				btn.className = 'upgrade-tab-btn';
				btn.setAttribute('role', 'tab');
				btn.setAttribute('aria-label', `${tab.label} achievements`);
				btn.dataset.tabKey = tab.key;
				const textNode = document.createTextNode(tab.label + ' ');
				btn.appendChild(textNode);
				const badge = document.createElement('span');
				badge.className = 'tab-badge';
				btn.appendChild(badge);
				btn.addEventListener('click', () => {
					achievementTabFilter = tab.key;
					renderAchievements();
				});
				tabContainer.appendChild(btn);
			});
		}
		Array.from(tabContainer.children).forEach(btn => {
			const key = btn.dataset.tabKey;
			const isActive = achievementTabFilter === key;
			btn.className = 'upgrade-tab-btn' + (isActive ? ' active' : '');
			btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
			const badge = btn.querySelector('.tab-badge');
			const tab = tabs.find(t => t.key === key);
			if (badge && tab) {
				badge.textContent = tab.count;
				badge.style.display = '';
			}
		});
	}

	// Update unlocked states and apply filter
	const showEmoji = achievementTabFilter === 'All';
	achievementData.forEach(ach => {
		const unlocked = game.achievements[ach.id].unlocked;
		const div = document.getElementById(`achievement-${ach.id}`);
		if (!div) return;

		// Filter visibility
		const visible = achievementTabFilter === 'All'
			|| (achievementTabFilter === 'Unlocked' && unlocked)
			|| (achievementTabFilter === 'Locked' && !unlocked);
		div.style.display = visible ? '' : 'none';

		if (unlocked) {
			div.className = 'achievement-item';
			div.setAttribute('aria-label', `Achievement unlocked: ${ach.name}`);
			const nameSpan = document.getElementById(`achievement-name-${ach.id}`);
			if (nameSpan) nameSpan.textContent = showEmoji ? `\u2713 ${ach.name}` : ach.name;
		} else {
			div.className = 'achievement-item achievement-locked';
			div.setAttribute('aria-label', `Achievement locked: ${ach.name}`);
			const nameSpan = document.getElementById(`achievement-name-${ach.id}`);
			if (nameSpan) nameSpan.textContent = showEmoji ? `\uD83D\uDD12 ${ach.name}` : ach.name;
		}
	});
}

let resetting = false;
function resetGame() {
	if (!confirm('Are you sure you want to reset ALL progress? This cannot be undone.')) return;
	resetting = true;
	localStorage.removeItem('bouncingBallUniverse');
	location.reload();
}

async function compressToBase64(jsonStr) {
	if (typeof CompressionStream === 'undefined') return null;
	const bytes = new TextEncoder().encode(jsonStr);
	const cs = new CompressionStream('deflate-raw');
	const writer = cs.writable.getWriter();
	writer.write(bytes);
	writer.close();
	const chunks = [];
	const reader = cs.readable.getReader();
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
	}
	const totalLen = chunks.reduce((s, c) => s + c.length, 0);
	const compressed = new Uint8Array(totalLen);
	let offset = 0;
	for (const chunk of chunks) {
		compressed.set(chunk, offset);
		offset += chunk.length;
	}
	let binary = '';
	for (let i = 0; i < compressed.length; i++) binary += String.fromCharCode(compressed[i]);
	return btoa(binary);
}

async function decompressFromBase64(b64) {
	if (typeof DecompressionStream === 'undefined') {
		throw new Error('decompression-unsupported');
	}
	const binary = atob(b64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	const ds = new DecompressionStream('deflate-raw');
	const writer = ds.writable.getWriter();
	writer.write(bytes);
	writer.close();
	const chunks = [];
	const reader = ds.readable.getReader();
	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
	}
	const totalLen = chunks.reduce((s, c) => s + c.length, 0);
	const decompressed = new Uint8Array(totalLen);
	let offset = 0;
	for (const chunk of chunks) {
		decompressed.set(chunk, offset);
		offset += chunk.length;
	}
	return new TextDecoder().decode(decompressed);
}

async function exportSave() {
	saveGame();
	const data = localStorage.getItem('bouncingBallUniverse') || '';
	const encoded = await compressToBase64(data);
	const container = document.getElementById('save-transfer');
	const textarea = document.getElementById('save-transfer-text');
	if (container) container.style.display = '';
	if (textarea) {
		textarea.value = encoded || data;
		textarea.focus();
		textarea.select();
	}
	announcePolite(encoded ? 'Save exported. Copy the text to back it up.' : 'Save exported as raw JSON (compression not supported).');
}

async function importSave() {
	const textarea = document.getElementById('save-transfer-text');
	const raw = textarea ? textarea.value.trim() : '';
	if (!raw) {
		announcePolite('Paste a save first.');
		return;
	}
	let parsed;
	try {
		if (raw.startsWith('{') || raw.startsWith('[')) {
			parsed = JSON.parse(raw);
		} else {
			const json = await decompressFromBase64(raw);
			parsed = JSON.parse(json);
		}
	} catch (e) {
		if (raw.startsWith('{') || raw.startsWith('[')) {
			announcePolite('Invalid save data (could not parse JSON).');
		} else {
			announcePolite('Invalid save data (could not decode).');
		}
		return;
	}
	if (!parsed || typeof parsed !== 'object' || parsed.totalBalls === undefined) {
		announcePolite('Invalid save data (missing game state).');
		return;
	}
	if (!confirm('Import this save? This will overwrite your current progress.')) return;
	try {
		// Prevent autosave/beforeunload from rewriting imported data before reload.
		resetting = true;
		localStorage.setItem('bouncingBallUniverse', JSON.stringify(parsed));
		window.removeEventListener('beforeunload', saveGame);
		location.reload();
	} catch (e) {
		resetting = false;
		console.error('Failed to import save:', e);
		announcePolite('Import failed while writing save data.');
	}
}

// Collapsible panels
function initCollapsiblePanels() {
	const panels = [
		{ id: 'save-panel', label: 'Save Data' },
		{ id: 'rubber-panel', label: 'Rubber Supply Chain' },
		{ id: 'production-panel', label: 'Ball Production Buildings' },
		{ id: 'upgrades-panel', label: 'Upgrades' },
		{ id: 'planets-panel', label: 'Planets & Universal Expansion' },
		{ id: 'logistics-panel', label: 'Logistics & Automation' },
		{ id: 'cosmic-panel', label: 'Celestial Bodies' },
		{ id: 'prestige-panel', label: 'Singularity' },
		{ id: 'achievements-panel', label: 'Achievements' }
	];

	panels.forEach(panelDef => {
		const panel = document.getElementById(panelDef.id);
		if (!panel) return;

		const h2 = panel.querySelector('h2');
		if (!h2) return;

		const collapsed = game.panelStates[panelDef.id] === false;

		const toggleBtn = document.createElement('button');
		toggleBtn.className = 'panel-toggle';
		toggleBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
		toggleBtn.setAttribute('aria-label', `Toggle ${panelDef.label} panel`);
		toggleBtn.textContent = collapsed ? '+' : '\u2212';

		h2.style.cursor = 'pointer';
		h2.style.userSelect = 'none';
		h2.appendChild(toggleBtn);

		const contentElements = [];
		let el = h2.nextElementSibling;
		while (el) {
			contentElements.push(el);
			el = el.nextElementSibling;
		}

		if (collapsed) {
			contentElements.forEach(e => e.style.display = 'none');
		}

		function toggle() {
			const isExpanded = toggleBtn.getAttribute('aria-expanded') === 'true';
			const newState = !isExpanded;
			toggleBtn.setAttribute('aria-expanded', newState ? 'true' : 'false');
			toggleBtn.textContent = newState ? '\u2212' : '+';
			game.panelStates[panelDef.id] = newState;

			const contentEls = [];
			let sibling = h2.nextElementSibling;
			while (sibling) {
				contentEls.push(sibling);
				sibling = sibling.nextElementSibling;
			}
			contentEls.forEach(e => e.style.display = newState ? '' : 'none');
		}

		h2.addEventListener('click', toggle);
	});
}

// Event listeners
document.getElementById('collect-btn').addEventListener('click', collectBalls);
document.getElementById('reset-btn').addEventListener('click', resetGame);
document.getElementById('export-save-btn').addEventListener('click', exportSave);
document.getElementById('import-save-btn').addEventListener('click', () => {
	const container = document.getElementById('save-transfer');
	if (container) container.style.display = '';
	const textarea = document.getElementById('save-transfer-text');
	if (textarea) {
		textarea.focus();
		textarea.select();
	}
});
document.getElementById('confirm-import-btn').addEventListener('click', importSave);
document.getElementById('hide-transfer-btn').addEventListener('click', () => {
	const container = document.getElementById('save-transfer');
	if (container) container.style.display = 'none';
});
document.getElementById('sandbox-btn').addEventListener('click', enterSandboxMode);
document.getElementById('sell-rubber-btn').addEventListener('click', sellRubber);

// Buy amount toggle
document.querySelectorAll('.buy-toggle-btn').forEach(btn => {
	btn.addEventListener('click', () => {
		const val = btn.dataset.amount;
		buyAmount = val === 'max' ? 'max' : parseInt(val);
		document.querySelectorAll('.buy-toggle-btn').forEach(b => {
			b.classList.toggle('active', b.dataset.amount === val);
			b.setAttribute('aria-pressed', b.dataset.amount === val ? 'true' : 'false');
		});
		updateDisplay(true);
	});
});

document.getElementById('planet-select').addEventListener('change', function() {
	selectPlanet(this.value);
});

document.addEventListener('keydown', function(e) {
	if ((e.key === ' ' || e.key === 'Enter') && e.target === document.body) {
		e.preventDefault();
		collectBalls();
	}
});

// Load saved game before first render
const wasLoaded = loadGame();

let gameLoopInterval = null;
let saveInterval = null;

// Start game loop
gameLoopInterval = setInterval(gameLoop, 100);

// Auto-save every 10 seconds
saveInterval = setInterval(saveGame, 10000);

// Save on page close
window.addEventListener('beforeunload', saveGame);

// Initial render - must happen after DOM is ready
function initRender() {
	initCollapsiblePanels();
	checkMilestones();
	updateDisplay(true);
	renderAchievements();
	if (wasLoaded) {
		announcePolite('Game loaded. Welcome back to Bouncing Ball Universe!');
	} else {
		announcePolite('Welcome to Bouncing Ball Universe! Click Bounce or press Space to start collecting balls.');
	}
}
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initRender);
} else {
	initRender();
}
