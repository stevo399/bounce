# Bouncing Ball Universe

From a single bouncy ball to universal domination. Build rubber supply chains, colonize planets, form celestial bodies, and collapse the universe itself.

Play it at [bounce.stevend.net](https://bounce.stevend.net), or open `index.html` in any browser. No installation required. Your progress saves automatically.

The game is pretty self explanatory so you shouldn't really need to read this documentation unless you're interested in the mechanics, or you manage to horribly misallocate your resources.

If you want formulas, exact stats for every building, or detailed breakdowns of how multipliers stack, check out the [Technical Reference](docs/technical-reference.md).

## Getting Started

The game starts kind of like an idle cookie clicker. Click "Bounce!" or press Space or Enter. You get a ball. Do it again. Keep going.

At first, that's all there is. As your ball count grows, the game starts opening up. At 50 balls you unlock upgrades, at 200 balls the rubber supply chain appears, and from there it just keeps going. Each new panel that shows up means you're ready for the next mechanic.

## How It All Fits Together

**Rubber** is the foundation. You build a six-stage supply chain that turns crude oil into usable rubber. Your output is only as fast as the weakest stage in the chain, so keep things balanced.

**Factories** consume that rubber to mass-produce balls. If you don't have enough rubber to feed them, production gets throttled. Watch the Production Ratio stat to see if you're keeping up.

**Planets** let you expand beyond Earth. Buy the four Discovery upgrades, launch a Von Neumann probe, and start colonizing. Each planet can be a Rubber World (1.5x rubber, no factories), a Ball World (1.5x balls, no rubber chain), or a Hybrid (both, but capped).

**Shipping probes** move rubber between planets automatically. Without them, your Ball Worlds have no rubber to work with. **Construction probes** auto-build infrastructure on your planets so you don't have to manage each one by hand.

**Celestial bodies** start forming at 10 trillion balls. There are nine tiers from Bouncy Moon up to the Singularity, each doubling the previous tier's production multiplier. You also unlock celestial structures along the way, which produce balls without needing any rubber.

**The Singularity** is the prestige system. At tier 9 you can collapse the universe, resetting most of your progress in exchange for Singularity Points. Those points buy permanent upgrades that make every future run faster. Do it 10 times and you win.

## Number Abbreviations

The game abbreviates large numbers with letter suffixes. Once you get past the trillions these can start to blur together. Tune out in math class? No problem, here's a full list:

| Suffix | Name | Value |
|--------|------|-------|
| K | Thousand | 1e3 |
| M | Million | 1e6 |
| B | Billion | 1e9 |
| T | Trillion | 1e12 |
| Q | Quadrillion | 1e15 |
| Qi | Quintillion | 1e18 |
| Sx | Sextillion | 1e21 |
| Sp | Septillion | 1e24 |
| Oc | Octillion | 1e27 |
| No | Nonillion | 1e30 |
| Dc | Decillion | 1e33 |
| Ud | Undecillion | 1e36 |
| Dd | Duodecillion | 1e39 |

## Progression Roadmap

The game smartly handles unlocking things as you need them, but this table is useful if you want to know what's coming next.

| Total Balls | What Opens Up |
|-------------|---------------|
| 10 | Achievements panel |
| 50 | Upgrades panel |
| 200 | Rubber supply chain |
| 50,000 | Basic Ball Factory |
| 150,000 | Advanced Ball Factory |
| 500,000 | Sentient Ball Hive (also Von Neumann probes, after Discovery upgrades) |
| 5,000,000 | City of Factories |
| 1,000,000,000 | Dyson Sphere Foundry |
| 5,000,000,000 | Cosmic Harvester |
| 1e13 | Celestial bodies and structures |
| 1e37 | Singularity (prestige reset available) |
| 10 singularities | Colossal Singularity (victory) |

## Tips

Keep your rubber supply chain balanced. The weakest link will slow everything else down.

Specialize your planets. A Rubber World feeding a Ball World beats two Hybrids.

Once you have a few planets, get construction probes. They handle the tedious building and only pay 10% of normal costs.

Synergy upgrades are huge, but they require a minimum count of every chain building. Aim for uniformity across all six stages.

Celestial structures don't need rubber. Once you're in the cosmic tiers, they become your main source of balls.

The Prestige Efficiency branch reduces cost scaling permanently and compounds across every future run.

## Saving Your Game

Your progress auto-saves every 2 seconds to your browser's local storage, so you can close the tab and come back anytime. Use "Export Save" to back up your progress or move it to another device and "Import Save" to restore. Clearing your browser data will erase your save unless you've exported it.
