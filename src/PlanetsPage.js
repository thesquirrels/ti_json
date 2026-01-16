import React, {useEffect, useState} from "react";

function Planets({ dataDir, dataSources, handleDataSourceChange}) {

    const [systemData, setSystemData] = useState([]);
    useEffect(() => {
        async function fetchSystemData() {
            try{
                const url = dataDir + 'system_all.json'
                const systems = await fetch(url).then(r => r.json());
                setSystemData(systems);
            } catch (e) {
                console.error('Error loading systems:', e);
            }
        }
        fetchSystemData();
    }, [dataSources]);

    const [planetData, setPlanetData] = useState([]);
    useEffect(() => {
        async function fetchPlanetData() {
            try{
                const url = dataDir + 'planet_all.json'
                const planets = await fetch(url).then(r => r.json());
                setPlanetData(planets);
            } catch (e) {
                console.error('Error loading planets:', e);
            }
        }
        fetchPlanetData();
    }, [dataSources]);

    function parseId(raw, idx) {
        if (raw == null) return { rank: 9, num: Infinity, suffix: '', head: '', origIndex: idx };

        // If already a number
        if (typeof raw === 'number' && Number.isFinite(raw)) {
            return { rank: 0, num: raw, suffix: '', head: '', origIndex: idx };
        }

        const s = String(raw).trim();

        // 1) pure number: "01", "99"
        let m = s.match(/^(\d+)$/);
        if (m) return { rank: 0, num: parseInt(m[1], 10), suffix: '', head: '', origIndex: idx };

        // 2) number + suffix: "01a", "87b", "123abc"
        m = s.match(/^(\d+)([A-Za-z]+)$/);
        if (m) return { rank: 1, num: parseInt(m[1], 10), suffix: m[2].toLowerCase(), head: '', origIndex: idx };

        // 3) letter-prefixed with number inside: "e01", "X9", "sys12a"
        m = s.match(/^([A-Za-z]+)(\d+)([A-Za-z]*)$/);
        if (m) {
            return {
                rank: 2,
                head: m[1].toLowerCase(),
                num: parseInt(m[2], 10),
                suffix: m[3].toLowerCase(),
                origIndex: idx
            };
        }

        // 4) fallback: put last, compare lexically
        return { rank: 8, num: Infinity, suffix: s.toLowerCase(), head: s.toLowerCase(), origIndex: idx };
    }

    function mixedIdCompare(a, b) {
        // get comparable keys (use index to keep stability if equal)
        const ka = parseId(a?.id, a?.__i ?? 0);
        const kb = parseId(b?.id, b?.__i ?? 0);

        if (ka.rank !== kb.rank) return ka.rank - kb.rank;

        // same rank: compare within bucket
        switch (ka.rank) {
            case 0: // pure numbers
                if (ka.num !== kb.num) return ka.num - kb.num;
                break;

            case 1: // number+suffix
                if (ka.num !== kb.num) return ka.num - kb.num;
                return ka.suffix.localeCompare(kb.suffix);

            case 2: // letter-prefixed: head, then number, then suffix
                if (ka.head !== kb.head) return ka.head.localeCompare(kb.head);
                if (ka.num  !== kb.num)  return ka.num - kb.num;
                return ka.suffix.localeCompare(kb.suffix);

            default: // fallback
                // compare head/suffix strings to get deterministic order
                if (ka.head !== kb.head) return ka.head.localeCompare(kb.head);
                return ka.suffix.localeCompare(kb.suffix);
        }

        // stable tie-break
        return (a.__i ?? 0) - (b.__i ?? 0);
    }

    // Make a sorted view based on systems' planet order
    const sortedPlanetData = React.useMemo(() => {
        if (!Array.isArray(planetData) || !Array.isArray(systemData) ||
            planetData.length === 0) return planetData;

        // (Optional) control system ordering here: as loaded, or by tile number, etc.
        const systems = [...systemData].map((x, i) => ({ ...x, __i: i })).sort(mixedIdCompare);


        // Build a rank index: first time we see a planet id, assign the next rank
        const rank = Object.create(null);
        let seq = 0;
        for (let i = 0; i < systems.length; i++) {
            const ids = Array.isArray(systems[i]?.planets) ? systems[i].planets : [];
            for (let j = 0; j < ids.length; j++) {
                const pid = ids[j];
                if (rank[pid] == null) rank[pid] = seq++;
            }
        }

        // Sort planets by rank; unseen ids go after all ranked ones
        const INF = Number.POSITIVE_INFINITY;
        const out = [...planetData].sort((a, b) => {
            const ra = rank[a?.id] != null ? rank[a.id] : INF;
            const rb = rank[b?.id] != null ? rank[b.id] : INF;
            if (ra !== rb) return ra - rb;
            // tie-breaker (both unranked or same rank): by name, then id
            const an = (a?.name || '').localeCompare(b?.name || '');
            if (an !== 0) return an;
            return (a?.id || '').localeCompare(b?.id || '');
        });

        return out;
    }, [planetData, systemData]);

    const filteredDataPlanets = sortedPlanetData.filter(planetCard => {
        const isFromSelectedSource = (
            (dataSources.basePok && (planetCard.source === 'base' ||
                planetCard.source === 'codex1' || planetCard.source === 'pok')) ||
            (dataSources.keleres && planetCard.source === 'codex2') ||
            (dataSources.keleres && planetCard.source === 'codex3') ||
            (dataSources.keleres && planetCard.source === 'codex4') ||
            (dataSources.discordantStars && (planetCard.source === 'ds' || planetCard.source === 'uncharted_space')) ||
            (dataSources.thunders_edge && planetCard.source === 'thunders_edge')
        );

        const isExcluded = (planetCard.id ==="phantasm" ||
            planetCard.id ==="lockedmallice" ||
            planetCard.id ==="illusion" ||
            planetCard.id === "ordinianc4")

        const isFaction = Array.isArray(planetCard.planetTypes)
            ? planetCard.planetTypes.includes('FACTION')
            : planetCard.planetType === 'FACTION';

        const isFake = Array.isArray(planetCard.planetTypes)
            ? planetCard.planetTypes.includes('FAKE')
            : planetCard.planetType === 'FAKE';


        if (!isFromSelectedSource || isExcluded || isFaction || isFake) return false; // Filter out cards not from the selected sources

        return true;
    });

    // Planet type -> image file name
    function planetTypeImg(planetType) {
        var map = {
            HAZARDOUS:  'TI4_map_generator_bot/src/main/resources/general/Hazardous.png',
            INDUSTRIAL: 'TI4_map_generator_bot/src/main/resources/general/Industrial.png',
            CULTURAL:   'TI4_map_generator_bot/src/main/resources/general/Cultural.png',
        };
        return map[planetType] || null;
    }

    const renderTechOrUnitImages = (typeInput) => {
        // Map tech/unit types to corresponding image paths
        const techTypeToImage = {
            PROPULSION: 'TI4_map_generator_bot/src/main/resources/general/Propulsion_dark.png',
            WARFARE:    'TI4_map_generator_bot/src/main/resources/general/Warfare_dark.png',
            CYBERNETIC: 'TI4_map_generator_bot/src/main/resources/general/Cybernetic_dark.png',
            BIOTIC:     'TI4_map_generator_bot/src/main/resources/general/Biotic_dark.png',
            B:          'TI4_map_generator_bot/src/main/resources/general/Propulsion_dark.png',
            R:          'TI4_map_generator_bot/src/main/resources/general/Warfare_dark.png',
            Y:          'TI4_map_generator_bot/src/main/resources/general/Cybernetic_dark.png',
            G:          'TI4_map_generator_bot/src/main/resources/general/Biotic_dark.png',
        };
        if (typeInput == null) return null;
        const imageStyle = { height: '32px' };
        let tokens = [];
        if (Array.isArray(typeInput)) {
            tokens = typeInput;
        } else if (typeof typeInput === 'string') {
            // If it looks like letters (e.g., "BRY"), split chars; otherwise split on commas/space
            const compact = /^[BRYG]+$/.test(typeInput.trim());
            tokens = compact ? typeInput.trim().split('') : typeInput.split(/[,\s]+/).filter(Boolean);
        } else {
            return null;
        }
        return tokens.map((t, i) => {
            const key = String(t).toUpperCase();
            const src = techTypeToImage[key] || null;
            return src
                ? <img key={i} src={dataDir + src} alt={key} style={imageStyle} />
                : null;
        });
    };

    function StatPill({ bgSrc, value, alt, dataDir }) {
        return (
            <div className="stat-pill">
                <img className="stat-pill-bg" src={dataDir + bgSrc} alt={alt || ''} />
                <span className="stat-pill-value">{value}</span>
            </div>
        );
    }

    return (
        <div className="planet-grid-container">
            {filteredDataPlanets.map((planetCard) => {
                return (
                    <div key={planetCard.id} className="planet-grid-item">
                        <div className="card-header">
                            <div className="card-title" style={{fontWeight: 'bold', fontSize: '14pt'}}>{planetCard.name}</div>
                            <div className="right-stack">
                                <div className="type-row">
                                    {planetCard.legendaryAbilityName && (
                                        <img
                                            src={dataDir + 'TI4_map_generator_bot/src/main/resources/general/Legendary_complete.png'}
                                            className="card-legendary-image"
                                            alt="Legendary"
                                        />
                                    )}
                                    {(Array.isArray(planetCard.planetTypes) ? planetCard.planetTypes : [planetCard.planetType])
                                        .filter(Boolean)
                                        .map((t, i) => {
                                            const src = planetTypeImg(String(t).toUpperCase());
                                            return src ? (
                                                <img
                                                    key={`${t}-${i}`}
                                                    src={dataDir + src}
                                                    className="card-type-image"
                                                    alt={t}
                                                    title={t}
                                                />
                                            ) : null;
                                        })}
                                </div>

                                <div className="stat-row">
                                    {renderTechOrUnitImages(planetCard.techSpecialties)}
                                    <StatPill
                                        bgSrc={'TI4_map_generator_bot/src/main/resources/general/Ressourcesbg.png'}
                                        value={planetCard.resources}
                                        alt="Resources"
                                        dataDir={dataDir}
                                    />
                                    <StatPill
                                        bgSrc={'TI4_map_generator_bot/src/main/resources/general/Influencebg.png'}
                                        value={planetCard.influence}
                                        alt="Influence"
                                        dataDir={dataDir}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* anything else in the body can go here */}

                        <em className="flavor-text">{planetCard.flavourText}</em>
                    </div>

                );
            })}
        </div>
    );
}

export default Planets;