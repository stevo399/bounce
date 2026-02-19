# Technical Reference

This is the numbers-and-formulas companion to the [main README](../README.md). If you want to understand exactly how the game's systems work under the hood, or you're trying to figure out why your production is stalling, this is where to look.

## How Building Costs Work

Every building in the game, whether it's an Oil Extractor or a Cosmic String Resonator, follows the same cost formula. The price goes up exponentially as you buy more, but there's a softening curve built in so that costs don't become truly absurd at very high building counts.

The formula looks like this:

```
effectiveCount = min(count / (1 + count * 0.005), 100)
cost = floor(baseCost * costMult ^ effectiveCount)
```

The first few dozen buildings of a type get expensive quickly, following a clean exponential curve. But as you push past 100 or so, the effective exponent starts growing more slowly. By the time you're around 200 buildings it caps out at 100, so prices level off and stop climbing. This is what makes late game scaling feel less punishing than pure exponential growth would.

The base cost multiplier is 1.15x for most buildings (rubber chain, ball factories, probes) and 1.20x for celestial structures. Cost Reduction upgrades and the Prestige Efficiency branch can lower the 1.15x scaling down to as low as 1.09x.

## Rubber Supply Chain Details

The supply chain uses a bottleneck model. Each stage has a production rate determined by how many buildings you own of that type, multiplied by any relevant upgrades. But actual throughput is capped by the minimum rate across the entire chain.

So if your Oil Extractors can produce 15 crude/sec but your Forming Plants can only handle 8/sec, your rubber output is 8/sec. The game shows per-stage throughput in the supply chain panel, which makes it easy to spot where the bottleneck is.

Each building produces 1 unit/sec at base rate. That gets multiplied by:
1. Chain Efficiency upgrades (+50%, +100%, +200% per tier, per stage)
2. Bulk Processing upgrades (2x batch size per stage)
3. Synergy bonuses (up to +800% when you own 75+ of every chain building)
4. Celestial tier bonuses (Tidal Forces gives +50% rubber at tier 1, chain feed speed +50% at tier 6)
5. Prestige production multiplier (up to +500% at max level)
6. Rubber World specialization bonus (1.5x, upgradeable to 2x)
7. Cosmic tier multiplier (2x per tier, up to 512x at tier 9)

These all stack multiplicatively, hence why late game rubber production numbers get truly enormous.

## Ball Production Details

Ball production comes from three sources: manual clicks, auto-collect passive income, and factories.

**Manual clicks** start at 1 ball per click. The five Click Power upgrades add +1, +2, +5, +10, and +25 for a total of 43 per click before multipliers. Cosmic tier 2 grants a 10x click multiplier on top of that.

**Auto-collect** is passive income that ticks every second regardless of rubber. The three Automation upgrades provide +1, +5, and +25 balls/sec.

**Factories** are where the real production happens. Each factory produces its listed balls/sec and consumes its listed rubber/sec. If your total rubber supply can't meet total factory demand, all factories are throttled proportionally. The Production Ratio stat shows this as a percentage.

Factory output gets multiplied by:
1. Factory Efficiency upgrades (+50%, +100%, +200% per tier, per factory type)
2. Ball World specialization bonus (1.5x, upgradeable to 2x)
3. Cosmic tier multiplier
4. Celestial acceleration upgrades (various multipliers tied to moon counts)
5. Prestige production multiplier
6. Planet Count Bonus (+25% per planet beyond 5)
7. Empire Momentum (logarithmic bonus from total building count)

The Cosmic Harvester is a special case. It produces 1,000 balls/sec at base rate and consumes zero rubber, so it's completely immune to rubber shortages.

## Ball Factories

| Factory | Base Cost | Balls/sec | Rubber/sec | Unlocks At |
|---------|-----------|-----------|------------|------------|
| Basic Ball Factory | 50 | 2 | 0.5 | 50K balls |
| Advanced Ball Factory | 1,000 | 25 | 3 | 150K balls |
| Sentient Ball Hive | 25,000 | 500 | 50 | 500K balls |
| City of Factories | 500,000 | 10,000 | 500 | 5M balls |
| Dyson Sphere Foundry | 10,000,000 | 200,000 | 5,000 | 1B balls |
| Cosmic Harvester | 5,000,000 | 1,000 | 0 | 5B balls |

## Celestial Tiers

| Tier | Celestial Body | Ball Threshold | Production Multiplier |
|------|---------------|----------------|----------------------|
| 1 | Bouncy Moon | 1e13 | 2x |
| 2 | Bouncy Planet | 1e16 | 4x |
| 3 | Bouncy Star | 1e19 | 8x |
| 4 | Giant Bouncy Star | 1e22 | 16x |
| 5 | Bouncy Black Hole | 1e25 | 32x |
| 6 | Supermassive Bouncy Black Hole | 1e28 | 64x |
| 7 | Bouncy Galaxy | 1e31 | 128x |
| 8 | Bouncy Great Attractor | 1e34 | 256x |
| 9 | Singularity | 1e37 | 512x |

The tier thresholds shown above are the base values. The Prestige Cosmic branch can reduce them by 25% (level 1) and then by another 50% (level 2), making subsequent runs reach higher tiers much faster.

When you advance to a new tier, the previous tier's celestial body count resets to zero. But within a tier, you accumulate more bodies as your ball count grows. The count is simply `floor(totalBalls / tierThreshold)`, so at 5e13 balls in tier 1 you'd have 5 Bouncy Moons.

Each tier also auto-grants a unique upgrade:

| Tier | Upgrade | Effect |
|------|---------|--------|
| 1 | Tidal Forces | +50% rubber production |
| 2 | Planetary Tectonics | 10x click value |
| 3 | Solar Wind | +100% ball production |
| 4 | Supergiant Pressure | Factories use 25% less rubber |
| 5 | Gravitational Lens | All costs reduced 15% |
| 6 | Hawking Insight | Chain stages feed 50% faster |
| 7 | Galactic Trade Routes | 3x shipping capacity |
| 8 | Cosmic Resonance | 3x celestial structure output |
| 9 | Singularity Proximity | Everything x5 |

## Celestial Structures

| Structure | Base Cost | Balls/sec | Requires Tier |
|-----------|-----------|-----------|---------------|
| Lunar Quarry | 1e13 | 1e9 | 1 |
| Planetary Core Tap | 1e16 | 1e12 | 2 |
| Stellar Forge | 1e19 | 1e15 | 3 |
| Nebula Collector | 1e22 | 1e18 | 4 |
| Accretion Disk Harvester | 1e25 | 1e21 | 5 |
| Hawking Radiation Converter | 1e28 | 1e24 | 6 |
| Dark Matter Converter | 1e31 | 1e27 | 7 |
| Cosmic String Resonator | 1e34 | 1e30 | 8 |

These scale at 1.20x per purchase. They require no rubber and aren't tied to any planet, so they produce balls regardless of your supply chain status. Their output is multiplied by the Celestial Harvest upgrade (5x at 100 moons) and the tier 8 Cosmic Resonance bonus (3x).

## Planet Colonization Details

Colonization milestones follow a dampened exponential curve. The formula for the Nth colonization milestone is roughly `500,000 * 3^(dampened N)`, where the exponent grows more slowly at high values. Early milestones are around 500K, 1.5M, 4.5M, 13.5M, and so on, but the spacing becomes less aggressive as you colonize more planets.

Planet roles and their mechanics:

**Rubber World** gets a base 1.5x bonus to all rubber production on that planet. It cannot build any ball factory buildings. There's no cap on rubber chain buildings. The bonus can be increased to 1.75x and then 2x through the Specialized Workforce and Expert Workforce upgrades.

**Ball World** gets a base 1.5x bonus to all ball production on that planet. It cannot build any rubber chain buildings, which means it produces zero rubber and relies entirely on shipping probes. No building cap. Same bonus upgrades apply.

**Hybrid** planets can build both rubber chain and ball factory buildings, but each building type is capped at 25. The Planetary Governor and Regional Planning upgrades raise this to 35 and then 50. No production bonus.

## Logistics Details

**Shipping probes** distribute rubber automatically. The system calculates which planets have a surplus (rubber production exceeds factory demand) and which have a deficit, then moves rubber from surplus to deficit proportionally based on need. Each probe moves 5 rubber/sec at base rate. The Cargo Optimization upgrade multiplies this by 1.5x, Hyperspace Lanes by another 2x, and the tier 7 Galactic Trade Routes bonus adds another 3x on top.

**Construction probes** pick the planet with the fewest buildings and assign themselves there. On Rubber Worlds, they try to keep the supply chain balanced by building whichever stage has the fewest buildings. On Ball Worlds, they build the cheapest available factory type. On Hybrids, they alternate between rubber and ball buildings.

Each construction takes 30 seconds at base rate. The three Construction upgrades reduce this to 22.5s, 15s, and 7.5s. The Celestial Acceleration upgrade "Orbital Assembly" at 75 moons further multiplies build speed by 3x. Construction probes pay only 10% of normal building cost, making them extremely efficient for expanding your empire.

## Upgrade Categories in Detail

### Click Power (5 upgrades)

| Upgrade | Cost | Effect |
|---------|------|--------|
| Stronger Fingers | 25 | +1 per click |
| Rubber Gloves | 100 | +2 per click |
| Spring-Loaded Palm | 500 | +5 per click |
| Pneumatic Press | 2,500 | +10 per click |
| Quantum Tap | 15,000 | +25 per click |

### Automation (3 upgrades)

| Upgrade | Cost | Effect |
|---------|------|--------|
| Auto-Bounce | 150 | +1 ball/sec passive |
| Auto-Bounce II | 3,000 | +5 balls/sec passive |
| Auto-Bounce III | 15,000 | +25 balls/sec passive |

### Chain Efficiency (18 upgrades)

Three tiers for each of the six supply chain stages. Tier 1 requires 3 buildings of that stage, tier 2 requires 8, tier 3 requires 15. Effects are +50%, +100%, and +200% output speed for that stage.

### Cost Reduction (6 upgrades)

One per supply chain stage. Requires 10 buildings of that stage. Reduces cost scaling from 1.15x to 1.12x for that building type.

### Factory Efficiency (12 upgrades)

Three tiers for each of the four main factory types (Basic through City of Factories). Tier 1 requires 5 factories, tier 2 requires 15, tier 3 requires 30. Effects are +50%, +100%, and +200% output.

### Bulk Processing (6 upgrades)

One per supply chain stage. Requires 10 buildings. Doubles the batch size at that stage, effectively doubling throughput.

### Synergy (6 upgrades)

These require you to own a minimum count of every single rubber chain building type simultaneously. That's what makes them tricky to unlock but extremely powerful.

| Upgrade | Cost | Requirement | Rubber Bonus |
|---------|------|-------------|--------------|
| Streamlined Pipeline | 50K | 5+ of each | +25% |
| Industrial Complex | 200K | 10+ of each | +50% |
| Manufacturing Empire | 1M | 20+ of each | +100% |
| Rubber Baron | 5M | 35+ of each | +200% |
| Polymer Singularity | 25M | 50+ of each | +400% |
| Molecular Mastery | 100M | 75+ of each | +800% |

### Discovery (4 upgrades)

These are the prerequisite chain for unlocking planetary colonization. They also provide small production bonuses.

| Upgrade | Cost | Also Gives |
|---------|------|------------|
| Long Range Sensors | 100K | 1.1x rubber |
| Signal Processing | 200K | 1.1x balls |
| Orbital Telescope | 350K | 1.15x rubber |
| Probe Blueprints | 500K | 1.15x balls |

### Shipping (5 upgrades)

Only visible after you've built your first shipping probe.

| Upgrade | Cost | Effect |
|---------|------|--------|
| Cargo Optimization | 10M | +50% rubber per shipping probe |
| Hyperspace Lanes | 50M | +100% shipping capacity |
| Quantum Entanglement Shipping | 200M | Rubber arrives instantly |
| Fleet Coordination | 100M | Shipping probes cost 25% less |
| Galactic Trade Network | 500M | Surplus rubber auto-sells at 10:1 |

### Construction (5 upgrades)

Only visible after you've built your first construction probe.

| Upgrade | Cost | Effect |
|---------|------|--------|
| Rapid Assembly | 15M | Build time reduced 25% |
| Prefabrication | 75M | Build time reduced 50% |
| Nanoscale Construction | 300M | Build time reduced 75% |
| Blueprint Sharing | 500M | Probes build 2 buildings at once |
| Self-Improving Builders | 800M | Probes get faster over time |

### Planet Mastery (6 upgrades)

| Upgrade | Cost | Unlock Condition | Effect |
|---------|------|------------------|--------|
| Specialized Workforce | 5M | Any specialized planet | Specialization bonus 1.5x to 1.75x |
| Expert Workforce | 20M | 3+ specialized planets | Bonus to 2x |
| Planetary Governor | 2M | Any hybrid (with 2+ planets) | Hybrid cap 25 to 35 |
| Regional Planning | 10M | 3+ hybrid planets | Hybrid cap to 50 |
| Terraforming I | 15M | 5+ planets | New planets start with 5 buildings |
| Terraforming II | 50M | 10+ planets | New planets start with 15 buildings |

### Discovery Acceleration (10 upgrades)

Only visible after launching your Von Neumann probe. These dramatically speed up planet discovery over time.

| Upgrade | Cost | Effect |
|---------|------|--------|
| Faster-Than-Light Probes | 30M | Travel time halved |
| Parallel Replication | 100M | 2 planets per cycle |
| Replication Efficiency | 250M | Cycle scaling 1.5x to 1.3x |
| Deep Space Network | 500M | Discoveries happen offline |
| Swarm Intelligence | 1B | +2 planets per cycle (total 4) |
| Warp Probes | 5B | Base cycle time 60s to 30s |
| Exponential Replication | 20B | Cycle scaling 1.3x to 1.15x |
| Galactic Swarm | 100B | +4 planets per cycle (total 8) |
| Subspace Relay | 500B | Base cycle time to 10s |
| Von Neumann Singularity | 5T | Cycle time no longer increases |

### Celestial Acceleration (8 upgrades)

These unlock based on your Bouncy Moon count and provide massive multipliers.

| Upgrade | Cost | Requirement | Effect |
|---------|------|-------------|--------|
| Moonstone Mining | 1T | 3 moons | 3x rubber production |
| Tidal Surge | 5T | 10 moons | 3x ball production |
| Lunar Foundries | 25T | 25 moons | 5x ball factory output |
| Gravitational Compression | 50T | 50 moons | Rubber use halved |
| Orbital Assembly | 100T | 75 moons | Construction probes 3x faster |
| Celestial Harvest | 250T | 100 moons | 5x celestial structure output |
| Mass Acceleration | 1Q | 250 moons | 10x all production |
| Lunar Convergence | 5Q | 500 moons | 25x all production |

### Prestige Upgrades (15 upgrades)

Purchased with Singularity Points. These persist across all future runs.

| Branch | Level | SP Cost | Effect |
|--------|-------|---------|--------|
| Production | 1 | 1 | +20% base production |
| Production | 2 | 2 | +50% base production |
| Production | 3 | 4 | +100% base production |
| Production | 4 | 8 | +250% base production |
| Production | 5 | 15 | +500% base production |
| Efficiency | 1 | 2 | Cost scaling 1.15x to 1.13x |
| Efficiency | 2 | 5 | Cost scaling to 1.11x |
| Efficiency | 3 | 10 | Cost scaling to 1.09x |
| Logistics | 1 | 1 | Start with 1 free shipping probe |
| Logistics | 2 | 3 | Start with 3 free shipping probes |
| Logistics | 3 | 7 | Start with 10 free shipping probes |
| Discovery | 1 | 3 | Von Neumann travel time halved |
| Discovery | 2 | 8 | Travel time halved again |
| Cosmic | 1 | 5 | Tier thresholds reduced 25% |
| Cosmic | 2 | 12 | Tier thresholds reduced 50% |

## Hidden Multipliers

There are a few bonus multipliers that aren't shown in the upgrade list but quietly reward you for building broadly.

**Planet Count Bonus** gives +25% production for every planet you control beyond your fifth. So at 10 planets you'd have a +125% bonus. This applies to all production globally.

**Empire Momentum** is a logarithmic bonus based on the total number of buildings across all your planets. It's not a huge multiplier early on, but it adds up as your empire grows. The more infrastructure you have spread everywhere, the faster everything runs.

**Specialization Bonus** is the 1.5x multiplier that Rubber Worlds and Ball Worlds get on their respective production types. This is technically visible in the planet info, but worth mentioning here because it stacks with everything else multiplicatively and can be upgraded to 2x through Planet Mastery.

## Key Numbers at a Glance

These are the base values for various systems before any upgrades or multipliers apply.

| What | Value |
|------|-------|
| Shipping probe base cost | 1,000 balls |
| Construction probe base cost | 5,000 balls |
| Probe cost scaling | 1.15x per purchase |
| Shipping rate per probe | 5 rubber/sec |
| Construction build time | 30 seconds per building |
| Construction cost discount | 90% off (probes pay 10% of normal) |
| Von Neumann probe launch cost | 500,000 balls |
| Probe travel time | 60 seconds |
| Replication cycle scaling | 1.5x longer each cycle |
| Rubber sell price | 5 balls each |
| SP per singularity collapse | 10 base + up to 2 speed bonus |
| Singularities needed to win | 10 |

## Achievements

There are 46 achievements tracking your progress across every system in the game. In-game you can filter between locked and unlocked.

**Ball milestones:** First Bounce, Century of Bouncing, Megabounce (1M), Gigabounce (1B), Terabounce (1T), Decabounce (10T), Petabounce (1Q), Exabounce (1Qi), Zettabounce (1Sx), Yottabounce (1Sp)

**Production:** Rubber Rookie (first rubber), Supply Chain Master (complete chain), Automation Begins (first factory), Mass Production (10 factories), Factory Megacluster (100 factories), Factory Ecumenopolis (500 factories)

**Rubber:** Rubber Titan (100 total chain buildings), Supply Chain Dominance (50 of each chain building)

**Planets:** Rubber World, Ball World, Interplanetary Empire (3 planets), Balanced Empire (one of each role), Five Worlds, Galactic Industrialist (10 planets), Planetary Sovereign (15), Sector Governor (20)

**Logistics:** Logistics Network (first shipping probe), Automated Empire (first construction probe), Shipping Armada (25 shipping probes), Construction Swarm (25 construction probes)

**Cosmic:** Lunar Formation (tier 1), Stellar Genesis (tier 3), Event Horizon (tier 5), Galactic Architect (tier 7), Singularity Achieved (tier 9), Celestial Engineer (first structure), Celestial Foundry (10 structures), Celestial Empire (100 structures)

**Prestige:** Universe Reborn (first collapse), Veteran of Collapse (3), Master of Collapse (6), Legend of Collapse (10), Singularity Investor (accumulate 50 SP)
