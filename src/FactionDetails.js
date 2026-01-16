import {useParams, Link, useLocation} from "react-router-dom";
import React, {useEffect, useLayoutEffect, useState} from "react";
import './App.css';

function FactionDetails({ match , dataDir, dataSources, handleDataSourceChange}) {
    const { source, alias } = useParams(); // Get both source and alias from the URL
    const [selectedFaction, setSelectedFaction] = useState(null);

    const [leaderData, setLeaderData] = useState(null);  // Store leader data for the selected faction
    const [abilityData, setAbilityData] = useState(null);  // Store ability data
    const [homePlanetData, setHomePlanetData] = useState([]);  // Store home planet data
    const [unitData, setUnitData] = useState([]);  // Store all unit data
    const [extraComponents, setExtraComponents] = useState([]);
    const [breakthroughData, setBreakthroughData] = useState([]);
    const [customStartingTech, setCustomStartingTech] = useState([]);
    const [techData, setTechData] = useState([]);  // Store technology data
    const [promissoryNoteData, setPromissoryNoteData] = useState([]);
    const [isMobileView, setIsMobileView] = useState(false); // State to track mobile view
    // Function to detect mobile view
    const handleResize = () => {
        setIsMobileView(window.innerWidth <= 768); // Adjust the width as per your layout needs
    };

    useEffect(() => {
        // Add event listener to window resize to track changes
        window.addEventListener('resize', handleResize);
        handleResize(); // Call it initially to set the correct view

        // Clean up the event listener
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        async function fetchFactionDetails() {
            const factionFileMap = {
                codex3: 'keleres.json',
                thunders_edge: 'te_factions.json',
            };
            const factionFile = factionFileMap[source] ?? `${source}.json`;
            try {
                const response = await fetch(dataDir + `TI4_map_generator_bot/src/main/resources/data/factions/${factionFile}`);
                const data = await response.json();
                const foundFaction = data.find(faction => faction.alias === alias);
                setSelectedFaction(foundFaction);
            } catch (error) {
                console.error('Error fetching faction data:', error);
            }
        }
        fetchFactionDetails();
    }, [alias]);

    // Helper function to render faction decals based on alias
    const renderFactionDecal = (alias) => {
        // Construct the decal image path based on the alias
        const decalPath = dataDir + `TI4_map_generator_bot/src/main/resources/factions/${alias}.png`;

        // Style for the decal image
        const decalStyle = {
            height: '1.5em',  // Adjust size as needed
            marginRight: '10px',  // Add spacing between the decal and the text
            verticalAlign: 'middle'  // Ensure it aligns with the text
        };

        // Render the decal image
        return <img src={decalPath} alt={`${alias} decal`} style={decalStyle} />;
    };

    const lowerFirstLetter = (str) => {
        if (!str) return "";  // Return empty string if str is undefined or null
        return str.charAt(0).toLowerCase() + str.slice(1);
    };
    const ensurePeriod = (str) => {
        if (!str) return "";  // Return empty string if str is undefined or null
        return str.trim().endsWith(".") ? str : str + ".";
    };

    // Helper function to map tech type to corresponding color
    const getTechTypeColor = (types) => {
        const typeMap = {
            "PROPULSION": "B",
            "WARFARE": "R",
            "CYBERNETIC": "Y",
            "BIOTIC": "G"
        };

        // Return the color for the first type that matches, or "Unknown" if no match
        const firstType = types?.[0];  // Get the first tech type in the array
        return typeMap[firstType] || "Unknown";
    };

    // Helper function to map tech/unit types to images and render them
    const renderTechOrUnitImages = (typeString) => {
        // Map tech/unit types to corresponding image paths
        const techTypeToImage = {
            B: 'TI4_map_generator_bot/src/main/resources/general/Propulsion_dark.png',
            R: 'TI4_map_generator_bot/src/main/resources/general/Warfare_dark.png',
            Y: 'TI4_map_generator_bot/src/main/resources/general/Cybernetic_dark.png',
            G: 'TI4_map_generator_bot/src/main/resources/general/Biotic_dark.png',
        };

        // Function to get the image path for a given type
        const getTechTypeImage = (type) => techTypeToImage[type] || null;

        // Style for images
        const imageStyle = { height: '1em', verticalAlign: 'middle' };
        if (typeof typeString !== 'string') {
            return null; // Return null if not a valid string
        }
        // Split the typeString into individual characters and render each as an image
        return typeString.split('').map((char, index) => {
            const techTypeImage = getTechTypeImage(char);
            return techTypeImage ? (
                <img key={index} src={dataDir + techTypeImage} alt={char} style={imageStyle} />
            ) : (
                <span key={index}>{char}</span> // Fallback if no image is found for the type
            );
        });
    };

    // Normalizes Keleres aliases to 'keleres'
    const normalizeFactionAlias = (alias) => {
        const keleresAliases = ['keleresm', 'keleresx', 'keleresa'];
        return keleresAliases.includes(alias) ? 'keleres' : alias;
    };

    // Normalize tokens like "Space_Dock", "space dock", "CRUiser" → "spacedock", "spacedock", "cruiser"
    function normToken(s) {
        return String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
    }

// Build a big alias map once
    function buildUnitMap() {
        // canonical name -> list of aliases/typos (include canonical itself)
        var aliasesByCanon = {
            // Core units
            'carrier':      ['carrier','cv','carriers','car','carol','carols','carr'],
            'cruiser':      ['cruiser','ca','cr','cruisers','cru','cruser','criuser','tommer','cruiswr','crusier','cl'],
            'destroyer':    ['destroyer','dd','destroyers','destoryer','destoryers','stroter','stroters','dest','des','stroder','stroders','strudel','strudels','dangle','bopper','danglebopper'],
            'dreadnought':  ['dreadnought','dn','dread','dr','dreadnough','dreadnaugh','dreads','dreadnaught','dreadnaughts','dred','dreds','chad','chads'],
            'fighter':      ['fighter','ff','fighters','figter','fight','ftr','hp','hps','figther','ffs'],
            'flagship':     ['flagship','fs','flag','flaggy','hugevan','flagy'],
            'infantry':     ['infantry','inf','gf','groud','groundforce','dude','duder','dudes','duders','dudettes','dudette','infantery'],
            'mech':         ['mech','mf','mechanized','mechs'],
            'pds':          ['pds','pd','pdf'],
            'space dock':   ['space dock','sd','spacedock','space_dock','dock','spd'],
            'war sun':      ['war sun','ws','war','warsuns','war_sun','peacesun','peace','warsun'],

            'cabal space dock': ['csd','vsd','vrcsd','dtsd','cabalspacedock','vuildock','cabaldock','cabalsd'],
            "tyrant's lament":  ['tyrantslament','tyrant','absolfs','tyr','lament'],
            'the lady':         ['lady','thelady','gheminalady'],
            'plenary orbital':  ['plenaryorbital','plenary','orbital','plen','orb'],
            'cavalry (nomad pn)': ['cavalry','calvary','calvery','cav','nomadpn'],
        };

        var map = {};
        Object.keys(aliasesByCanon).forEach(function(canon) {
            aliasesByCanon[canon].forEach(function(alias) {
                map[normToken(alias)] = canon;   // every alias → canonical
            });
            map[normToken(canon)] = canon;     // canonical → canonical
        });
        return map;
    }

    const unitMap = buildUnitMap();

    const formatUnitInfo = (unit, prerequisites = null) => {
        const fields = [];

        if (unit.afbHitsOn) {
            fields.push(
                <span key="afb">
                    <strong>ANTI-FIGHTER BARRAGE </strong> {unit.afbHitsOn}x{unit.afbDieCount}
                </span>
            );
        }
        if (unit.bombardHitsOn) {
            fields.push(
                <span key="bombard">
                    <strong>BOMBARDMENT </strong> {unit.bombardHitsOn}x{unit.bombardDieCount}
                </span>
            );
        }
        if (unit.spaceCannonHitsOn) {
            fields.push(
                <span key="space_cannon">
                    <strong>SPACE CANNON </strong> {unit.spaceCannonHitsOn}x{unit.spaceCannonDieCount}
                </span>
            );
        }
        // Add sustain damage if true
        if (unit.sustainDamage) {
            fields.push(<span key="sustainDamage"><strong>SUSTAIN DAMAGE</strong></span>);
        }

        // Add production value if it exists
        if (unit.productionValue) {
            fields.push(<span key="production"><strong>PRODUCTION </strong> {unit.productionValue}</span>);
        }

        // Add planetary shield if true
        if (unit.planetaryShield) {
            fields.push(<span key="planetaryShield"><strong>PLANETARY SHIELD</strong></span>);
        }

        // Add cost if it exists
        if (unit.cost) {
            const displayCost = unit.cost === 0.5 ? "1x2" : unit.cost;
            fields.push(<span key="cost"><strong>Cost:</strong> {displayCost}</span>);
        }

        // Add combat info if combatHitsOn exists
        if (unit.combatHitsOn) {
            fields.push(
                <span key="combat">
                    <strong>Combat:</strong> {unit.combatHitsOn}x{unit.combatDieCount}
            </span>
            );
        }
        // Add move value if it exists
        if (unit.moveValue) {
            fields.push(<span key="move"><strong>Move:</strong> {unit.moveValue}</span>);
        }

        // Add capacity if it exists
        if (unit.capacityValue) {
            fields.push(<span key="capacity"><strong>Capacity:</strong> {unit.capacityValue}</span>);
        }

        const hasAbility = !!unit.ability;

        // Join fields with commas and return the formatted JSX
        return (
            <>
                <span><strong>{unit.name}</strong> {prerequisites ? (
                    <>
                        {renderTechOrUnitImages(prerequisites)}
                    </>
                ) : (
                    <>
                        ({unit.baseType})
                    </>
                )}
                </span>
                <br/>

                {/* Display ability first, if it exists */}
                {hasAbility && (
                    <>
                        <span key="ability">{unit.ability}</span>
                        <br/>
                    </>
                )}

                {/* Render any remaining fields that are not part of the core stats */}
                {fields
                    .filter(
                        (field) =>
                            field.key !== 'cost' &&
                            field.key !== 'combat' &&
                            field.key !== 'move' &&
                            field.key !== 'capacity'
                    )
                    .map((field, index, array) => (
                        <React.Fragment key={index}>
                            {field}
                            {index < array.length - 1 && ", "}
                        </React.Fragment>
                    ))}
                {fields
                    .filter(
                        (field) =>
                            field.key !== 'cost' &&
                            field.key !== 'combat' &&
                            field.key !== 'move' &&
                            field.key !== 'capacity'
                    )
                    .length > 0 && <br/>}
                {/* Display core stats (Cost, Combat, Move, Capacity) in the desired order */}
                {[
                    fields.find((field) => field.key === 'cost'),
                    fields.find((field) => field.key === 'combat'),
                    fields.find((field) => field.key === 'move'),
                    fields.find((field) => field.key === 'capacity')
                ]
                    .filter(Boolean) // Filter out any undefined fields if any are missing
                    .map((field, index, array) => (
                        <React.Fragment key={index}>
                            {field}
                            {index < array.length - 1 && ", "}
                        </React.Fragment>
                    ))
                }
            </>
        );
    };

    // --- normalization helpers ---
    function normToken(s) { return String(s).toLowerCase().replace(/[^a-z0-9]/g, ''); }
    function pluralize(name, n) {
        // special cases
        if (name === 'infantry') return n + ' infantry';
        if (name === 'pds')      return n + ' PDS' + (n > 1 ? 's' : '');
        if (name === 'war sun')  return n + ' war sun' + (n > 1 ? 's' : '');
        if (name === 'space dock') return n + ' space dock' + (n > 1 ? 's' : '');
        // default
        return n + ' ' + name + (n > 1 ? 's' : '');
    }

    const parseStartingFleet = (fleetString) => {
        var counts = {};                   // total by unit
        var byFlag = {};                   // per-flag by unit
        var parts = String(fleetString || '').split(',');

        for (var i = 0; i < parts.length; i++) {
            var part = parts[i].trim();
            if (!part) continue;

            // capture: optional count, unit token, optional trailing flag word/letter
            // e.g. "1 inf r", "ff", "2 space_dock s"
            var m = part.match(/^\s*(\d+)?\s*([a-z0-9_]+)(?:\s+([a-z0-9_]+))?\s*$/i);
            if (!m) continue;

            var n    = m[1] ? parseInt(m[1], 10) : 1;
            var unit = normToken(m[2]);
            var flag = m[3] || '';

            var canon = unitMap[unit];
            if (!canon) continue; // unknown token -> skip or log

            // bump totals
            counts[canon] = (counts[canon] || 0) + n;

            // bump flag bucket
            if (flag) {
                if (!byFlag[canon]) byFlag[canon] = {};
                byFlag[canon][flag] = (byFlag[canon][flag] || 0) + n;
            }
        }

        // Build a pretty summary like your existing function
        var order = ['flagship','war sun','dreadnought','cruiser','destroyer','carrier','fighter','infantry','mech','pds','space dock'];
        var items = [];
        order.forEach(function(name){
            if (counts[name]) items.push(pluralize(name, counts[name]));
        });
        // Include any others not in the preferred order
        Object.keys(counts).forEach(function(name){
            if (order.indexOf(name) === -1) items.push(pluralize(name, counts[name]));
        });

        return items.join(', ')
    };

    const formatTechText = (text) => {
        if (!text) return null;

        // Check if the text starts with "ACTION:" and bold it
        if (text.startsWith("ACTION:")) {
            return (
                <>
                    <strong>ACTION:</strong> {text.slice(7)} {/* Remove "ACTION:" and display the rest */}
                </>
            );
        }

        return <>{text}</>;
    };

    useEffect(() => {
        if (selectedFaction && selectedFaction.source) {
            async function fetchLeaderData() {
                try {
                    var files = [dataDir + 'TI4_map_generator_bot/src/main/resources/data/leaders/pok.json'];
                    files.push(dataDir + 'TI4_map_generator_bot/src/main/resources/data/leaders/te_leaders.json');
                    if (selectedFaction.source === 'ds') {
                        files.push(dataDir + 'TI4_map_generator_bot/src/main/resources/data/leaders/ds.json');
                    }
                    var uniqueFiles = Array.from(new Set(files));
                    var jsons = await Promise.all(uniqueFiles.map(function (url) {
                        return fetch(url).then(function (r) { return r.json(); });
                    }));
                    var leaderData = [].concat.apply([], jsons); // flat()
                    setLeaderData(leaderData);  // Store leader data
                } catch (error) {
                    console.error("Error fetching leader data:", error);
                }
            }
            fetchLeaderData();
        }
    }, [selectedFaction]);

    // Load faction ability data based on the selected faction's source
    useEffect(() => {
        if (selectedFaction && selectedFaction.source) {
            async function fetchAbilityData() {
                try {
                    var abilitySource =
                        selectedFaction.source === "codex3"
                        ? "other"
                        : selectedFaction.source === "thunders_edge"
                        ? "te_abilities"
                        : selectedFaction.source;
                    const abilityResponse = await fetch(dataDir + `TI4_map_generator_bot/src/main/resources/data/abilities/${abilitySource}.json`);
                    const abilityJson = await abilityResponse.json();
                    setAbilityData(abilityJson);  // Store ability data
                } catch (error) {
                    console.error("Error fetching ability data:", error);
                }
            }
            fetchAbilityData();
        }
    }, [selectedFaction]);

    // Load faction ability data based on the selected faction's source
    useEffect(() => {
        if (selectedFaction && selectedFaction.source) {
            async function fetchBreakthroughData() {
                try {
                    var files = [dataDir + 'TI4_map_generator_bot/src/main/resources/data/breakthroughs/te_breakthroughs.json'];
                    if (selectedFaction.source === 'ds') {
                        files.push(dataDir + 'TI4_map_generator_bot/src/main/resources/data/breakthroughs/ds_breakthroughs.json');
                        files.push(dataDir + 'TI4_map_generator_bot/src/main/resources/data/breakthroughs/br_breakthroughs.json');
                    }
                    var uniqueFiles = Array.from(new Set(files));
                    var jsons = await Promise.all(uniqueFiles.map(function (url) {
                        return fetch(url).then(function (r) { return r.json(); });
                    }));
                    var btData = [].concat.apply([], jsons); // flat()
                    setBreakthroughData(btData);  // Store leader data

                } catch (error) {
                    console.error("Error fetching breakthrough data:", error);
                }
            }
            fetchBreakthroughData();
        }
    }, [selectedFaction]);

// Load home planet data based on the selected faction's homePlanets
    useEffect(() => {
        if (selectedFaction && selectedFaction.homePlanets) {
            async function fetchHomePlanetData() {
                try {
                    // Fetch all home planet JSON files in parallel
                    const planetPromises = selectedFaction.homePlanets.map(planet =>
                        fetch(dataDir + `TI4_map_generator_bot/src/main/resources/planets/${planet}.json`).then(res => res.json())
                    );
                    const planets = await Promise.all(planetPromises);
                    setHomePlanetData(planets);  // Store all fetched planet data
                } catch (error) {
                    console.error("Error fetching home planet data:", error);
                }
            }
            fetchHomePlanetData();
        }
    }, [selectedFaction]);


    useEffect(() => {
        if (selectedFaction && selectedFaction.source) {
            async function fetchTechData() {
                try {
                    var files = [dataDir + 'TI4_map_generator_bot/src/main/resources/data/technologies/pok.json'];
                    files.push(dataDir + 'TI4_map_generator_bot/src/main/resources/data/technologies/te_techs.json');
                    if (selectedFaction.source === 'ds') {
                        files.push(dataDir + 'TI4_map_generator_bot/src/main/resources/data/technologies/ds.json');
                    }
                    var uniqueFiles = Array.from(new Set(files));
                    var jsons = await Promise.all(uniqueFiles.map(function (url) {
                        return fetch(url).then(function (r) { return r.json(); });
                    }));
                    var techData = [].concat.apply([], jsons); // flat()
                    setTechData(techData); // Set the combined tech data
                } catch (error) {
                    console.error("Error fetching tech data:", error);
                }
            }
            fetchTechData();
        }
    }, [selectedFaction]);

    // Load unit data based on the selected faction's source
    useEffect(() => {
        if (selectedFaction && selectedFaction.source) {
            async function fetchUnitData() {
                try {
                    var files = [dataDir + 'TI4_map_generator_bot/src/main/resources/data/units/pok.json'];
                    files.push(dataDir + 'TI4_map_generator_bot/src/main/resources/data/units/te_units.json');
                    files.push(dataDir + 'TI4_map_generator_bot/src/main/resources/data/units/keleres.json');
                    if (selectedFaction.source === 'ds') {
                        files.push(dataDir + 'TI4_map_generator_bot/src/main/resources/data/units/ds.json');
                    }
                    var uniqueFiles = Array.from(new Set(files));
                    var jsons = await Promise.all(uniqueFiles.map(function (url) {
                        return fetch(url).then(function (r) { return r.json(); });
                    }));
                    var unitData = [].concat.apply([], jsons); // flat()
                    setUnitData(unitData);  // Store leader data
                } catch (error) {
                    console.error("Error fetching unit data:", error);
                }
            }
            fetchUnitData();
        }
    }, [selectedFaction]);


    // Load promissory note data based on the selected faction's source
    useEffect(() => {
        if (selectedFaction && selectedFaction.source) {
            async function fetchPromissoryNoteData() {
                try {
                    // Handle special case for base source
                    const promissorySource = selectedFaction.source === "base" || selectedFaction.source === "pok" || selectedFaction.source === "codex3" ?
                        "promissory_notes/promissory_notes" : `promissory_notes/${selectedFaction.source}`;
                    const promissoryResponse = await fetch(dataDir + `TI4_map_generator_bot/src/main/resources/data/${promissorySource}.json`);
                    const promissoryJson = await promissoryResponse.json();
                    setPromissoryNoteData(promissoryJson);
                } catch (error) {
                    console.error("Error fetching promissory note data:", error);
                }
            }

            fetchPromissoryNoteData();
        }
    }, [selectedFaction]);

    // Fetch starting_tech.json
    useEffect(() => {
        async function fetchCustomStartingTech() {
            try {
                const response = await fetch(dataDir + 'starting_tech.json'); // Adjust path accordingly
                const data = await response.json();
                setCustomStartingTech(data);
            } catch (error) {
                console.error('Error fetching custom starting tech data:', error);
            }
        }
        fetchCustomStartingTech();
    }, []);

    // Fetch the extra components JSON data
    useEffect(() => {
        async function fetchExtraComponents() {
            try {
                const response = await fetch(dataDir + 'misc_elements.json'); // Adjust path as necessary
                const data = await response.json();
                setExtraComponents(data);
            } catch (error) {
                console.error('Error fetching extra components:', error);
            }
        }
        fetchExtraComponents();
    }, []);

    useEffect(() => {
        if (selectedFaction) {
            // Set the document title to the faction's name
            document.title = `${selectedFaction.factionName}`;
        } else {
            // Set a default title while loading or if no faction is selected
            document.title = "Loading Faction Details...";
        }
    }, [selectedFaction]); // This effect runs every time `selectedFaction` changes


    // Automatically scroll the user down on page load
    const isMobile = window.innerWidth <= 768; // Check if it's mobile
    useEffect(() => {
        if (isMobile) {
            // Wait for faction content to be rendered and scroll smoothly
            window.scrollTo({
                top: 260, // Scroll to 200px down
                behavior: 'smooth' // Enable smooth scrolling
            });
        }

    }, [promissoryNoteData]);
    useEffect(() => {
        if (isMobile) {
            window.scrollTo({
                top: 0, // Scroll to 200px down
            });
        }
    }, []); // Dependency array now includes 'location', so this effect runs on route changes

    // Picks the best unit for a given baseType ("mech" or "flagship")
// Priority: thunders_edge > codex4 > codex3 > ds > pok
    function pickLatestUnit(units, baseType, selectedFaction, dataSources, normalizeFactionAlias) {
        units = units || [];
        dataSources = dataSources || {};
        var factionAlias = selectedFaction && selectedFaction.alias ? selectedFaction.alias : '';
        factionAlias = factionAlias.toLowerCase();

        // Filter to this faction + baseType
        var sameType = [];
        for (var i = 0; i < units.length; i++) {
            var u = units[i];
            if (!u) continue;
            var uFaction = u.faction ? String(u.faction).toLowerCase() : '';
            if (normalizeFactionAlias(uFaction) === normalizeFactionAlias(factionAlias) && u.baseType === baseType) {
                sameType.push(u);
            }
        }

        // Source priority (newest first)
        var priority = ['thunders_edge', 'codex4', 'codex3', 'pok', 'ds'];

        // Respect feature flags
        function allowed(src) {
            console.log(dataSources.thunders_edge);
            if (src === 'thunders_edge') return dataSources.thunders_edge;
            if (src === 'codex3' || src === 'codex4') return dataSources.keleres;
            if (src === 'ds') return dataSources.discordantStars;
            if (src === 'pok') return true; // fallback always allowed
            return false;
        }

        // Choose first matching source by priority
        for (var p = 0; p < priority.length; p++) {
            var src = priority[p];
            if (!allowed(src)) continue;
            for (var j = 0; j < sameType.length; j++) {
                if (sameType[j].source === src) return sameType[j];
            }
        }


        // If nothing passes flags, return any available (or null)
        return sameType.length ? sameType[0] : null;
    }
    var chosenFlagship = pickLatestUnit(unitData || [], 'flagship', selectedFaction, dataSources, normalizeFactionAlias);
    var chosenMech     = pickLatestUnit(unitData || [], 'mech',      selectedFaction, dataSources, normalizeFactionAlias);

    function synergyToTypeString(synergy) {
        var map = { PROPULSION:'B', WARFARE:'R', CYBERNETIC:'Y', BIOTIC:'G' };
        synergy = Array.isArray(synergy) ? synergy : [];
        var out = '';
        for (var i = 0; i < synergy.length; i++) {
            out += map[synergy[i]] || '';
        }
        return out;
    }
    // Find extras for this faction (once)
    var factionExtraComponents = (extraComponents || []).find(function (c) {
        return c && c.alias === (selectedFaction && selectedFaction.alias);
    });
// true only if there are components to show
    var hasExtra = !!(factionExtraComponents && Array.isArray(factionExtraComponents.components) && factionExtraComponents.components.length);

    // Add a loading state until faction data is fetched
    if (!(selectedFaction && leaderData && abilityData && homePlanetData)) return <p>Loading...</p>;

    const leaderTypeOrder = { agent: 0, commander: 1, hero: 2 };

    const factionKey =
        selectedFaction?.alias ?? selectedFaction?.id ?? selectedFaction?.name;

// 1) Get all leaders for this faction (possibly multiple per type from different sources)
    const factionLeaders = (leaderData || []).filter(
        (l) => l?.faction === factionKey && ["agent", "commander", "hero"].includes(l?.type)
    );

// 2) Your prioritize() function (unchanged except I removed the console.log)
    function prioritize(sameType) {
        var priority = ["thunders_edge", "codex4", "codex3", "pok", "ds"];

        function allowed(src) {
            if (src === "thunders_edge") return dataSources.thunders_edge;
            if (src === "codex3" || src === "codex4") return dataSources.keleres;
            if (src === "ds") return dataSources.discordantStars;
            if (src === "pok") return true; // fallback always allowed
            return false;
        }

        for (var p = 0; p < priority.length; p++) {
            var src = priority[p];
            if (!allowed(src)) continue;
            for (var j = 0; j < sameType.length; j++) {
                if (sameType[j].source === src) return sameType[j];
            }
        }
        return sameType.length ? sameType[0] : null;
    }

    function topNFromLatestSource(items, n) {
        if (!items || !items.length) return [];

        const priority = ["thunders_edge", "codex4", "codex3", "pok", "ds"];

        function allowed(src) {
            if (src === "thunders_edge") return dataSources.thunders_edge;
            if (src === "codex3" || src === "codex4") return dataSources.keleres;
            if (src === "ds") return dataSources.discordantStars;
            if (src === "pok") return true;
            return false;
        }

        // Choose best allowed source that exists in this set
        let chosenSource = null;
        for (let p = 0; p < priority.length; p++) {
            const src = priority[p];
            if (!allowed(src)) continue;
            if (items.some(it => it.source === src)) {
                chosenSource = src;
                break;
            }
        }

        // If nothing passes flags, fall back to whatever is present
        const filtered = chosenSource
            ? items.filter(it => it.source === chosenSource)
            : items;

        // Optional: stabilize ordering (if you have a numeric order field, use it here)
        const stable = filtered.slice().sort((a, b) => {
            // Try to keep a predictable order:
            // 1) if they have an explicit order/index, use it
            if (a.sortOrder != null && b.sortOrder != null) return a.sortOrder - b.sortOrder;
            // 2) else by name, else by id
            const an = (a.name || "").toLowerCase();
            const bn = (b.name || "").toLowerCase();
            if (an && bn && an !== bn) return an.localeCompare(bn);
            return String(a.id).localeCompare(String(b.id));
        });

        return stable.slice(0, n);
    }

    function countLeaderTypes(leaderKeys = []) {
        return leaderKeys.reduce(
            (acc, key) => {
                if (key.includes("agent")) acc.agent++;
                else if (key.includes("commander")) acc.commander++;
                else if (key.includes("hero")) acc.hero++;
                return acc;
            },
            { agent: 0, commander: 0, hero: 0 }
        );
    }

    const leaderCounts = countLeaderTypes(selectedFaction?.leaders || []);

    const chosenLeaders = ["agent", "commander", "hero"]
        .flatMap(type => {
            const sameType = factionLeaders.filter(l => l.type === type);
            const n = leaderCounts[type] || 0;

            if (!sameType.length || n === 0) return [];

            // Single leader → use prioritize()
            if (n === 1) {
                const one = prioritize(sameType);
                return one ? [one] : [];
            }

            // Multiple leaders → take top N from latest allowed source
            return topNFromLatestSource(sameType, n);
        })
        .sort((a, b) => (leaderTypeOrder[a.type] ?? 99) - (leaderTypeOrder[b.type] ?? 99));

    return (
        <div className="faction-details">
            <div className="column column-1">
                {/*<Link to="/" className="back-button">Back to Faction List</Link>*/}
                {/* Left Column: Faction Name and Abilities */}
                <div className="faction-name">
                    <h1 style={{paddingTop: '0px'}}>{renderFactionDecal(selectedFaction.alias)} {selectedFaction.factionName}</h1>
                </div>
                <div className="abilities">
                    <ul>
                        {selectedFaction.abilities.map(abilityKey => {
                            // Find the matching ability in abilityData array by id
                            const ability = abilityData.find(abilityItem => abilityItem.id === abilityKey);

                            if (ability) {
                                return (
                                    <li key={abilityKey}>
                                        <strong>{ability.name}</strong>
                                        <br/>
                                        {/* If ability.window is "ACTION", wrap in <strong>, otherwise no formatting */}
                                        {ability.window ? (
                                            ability.window === "ACTION" ? (
                                                <strong>ACTION: </strong>
                                            ) : (
                                                ability.window + ", "
                                            )
                                        ) : (
                                            ""
                                        )}
                                        {lowerFirstLetter(ability.windowEffect)} {ensurePeriod(ability.permanentEffect)}
                                    </li>
                                );
                            } else {
                                // Fallback if the ability data is not available
                                return <li key={abilityKey}>{abilityKey}</li>;
                            }
                        })}
                    </ul>
                </div>
                {/* Right Column: Home System, Starting Fleet, Commodities, and Starting Tech */}
                <div className="hs">
                    {/* Home System */}
                    <div>
                        <strong>Home System: </strong>
                        {homePlanetData.map((planet, index) => (
                            <span key={planet.id}>
                                        {planet.name}: {planet.resources}/{planet.influence}
                                {/* Conditionally render optional fields if they exist */}
                                {planet.techSpecialties && ` (Tech Specialties: ${planet.techSpecialties})`}
                                {planet.planetType && planet.planetType !== 'FACTION' && ` (Planet Type: ${planet.planetType})`}
                                {/* Add a comma and space after each planet except the last one */}
                                {index < homePlanetData.length - 1 && ", "}
                                    </span>
                        ))}
                        {homePlanetData.map(planet => (
                            planet.legendaryAbilityName && (
                                <div key={`${planet.id}-legendary`}>
                                    <em>{planet.name} Legendary Ability:</em> {planet.legendaryAbilityText}
                                </div>
                            )
                        ))}
                    </div>
                    {/* Starting Fleet */}
                    <div>
                        <strong>Starting Fleet: </strong>
                        {parseStartingFleet(selectedFaction.startingFleet)}
                    </div>
                    {/* Commodities */}
                    <div>
                        <strong>Commodities: </strong>
                        {selectedFaction.commodities}
                    </div>
                    {/* Starting Technologies */}
                    <strong>Starting Technologies: </strong>
                    {(() => {
                        // Find the custom starting tech for the selected faction
                        const customTech = customStartingTech.find(tech => tech.alias === selectedFaction.alias);
                        // If custom starting tech exists, display custom tech data
                        if (customTech) {
                            return (
                                <>
                                    <span>{customTech.text} </span>
                                    {customTech.techList.map((techAlias, index) => {
                                        const tech = techData.find(techItem => techItem.alias === techAlias);
                                        const isLastTech = index === customTech.techList.length - 1;
                                        return (
                                            <span key={techAlias}>
                                                        {tech ? (
                                                            <>
                                                                {renderTechOrUnitImages(getTechTypeColor(tech.types))} {tech.name}
                                                            </>
                                                        ) : (
                                                            <span>{techAlias} (Unknown Tech)</span>
                                                        )}
                                                {!isLastTech && ", "}
                                                    </span>
                                        );
                                    })}
                                </>
                            );
                        }

                        // Fallback: display regular starting tech if no custom data is found
                        return (
                            <>
                                {selectedFaction.startingTech.map((techAlias, index) => {
                                    const tech = techData.find(techItem => techItem.alias === techAlias);
                                    const isLastTech = index === selectedFaction.startingTech.length - 1;

                                    return (
                                        <span key={techAlias}>
                                                {tech ? (
                                                    <>
                                                        {renderTechOrUnitImages(getTechTypeColor(tech.types))} {tech.name}
                                                    </>
                                                ) : (
                                                    <span>{techAlias} (Unknown Tech)</span>
                                                )}
                                            {!isLastTech && ", "}
                                            </span>
                                    );
                                })}
                            </>
                        );
                    })()}

                    {factionExtraComponents?.tokens ? (
                        <div className="extra">
                            <strong>Additional Components: </strong>
                            {factionExtraComponents.tokens}
                        </div>
                    ) : null}

                    {dataSources && dataSources.thunders_edge ? (
                        <div>
                            <ul>
                                <strong>Breakthrough: </strong>
                                <ul>
                                    {(breakthroughData || [])
                                        .filter(function (bt) {
                                            // match faction (normalize like you do elsewhere)
                                            return normalizeFactionAlias(String(bt.faction || '').toLowerCase()) ===
                                                normalizeFactionAlias(String(selectedFaction.alias || '').toLowerCase());
                                        })
                                        .map(function (bt) {
                                            var title = bt.displayName || bt.name;
                                            var types = synergyToTypeString(bt.synergy);
                                            return (
                                                <li key={bt.alias}>
                                                    <strong>{title}</strong>
                                                    {" "}
                                                    ({renderTechOrUnitImages(types)})
                                                    <br/>
                                                    {/* Bold ACTION: like your abilities block */}
                                                    {bt.text && bt.text.indexOf('ACTION:') === 0 ? (
                                                        <>
                                                            <strong>ACTION: </strong>{bt.text.slice(7)}
                                                        </>
                                                    ) : (
                                                        <>{bt.text}</>
                                                    )}
                                                </li>
                                            );
                                        })}
                                </ul>
                            </ul>
                        </div>
                        ) : null}
                </div>
            </div>
            <div className="column column-2">
                <div className="units">
                    <h3>Flagship and Mech</h3>
                    <ul>
                        {chosenFlagship ? (
                            <li key={chosenFlagship.id}>
                                {formatUnitInfo(chosenFlagship)}
                            </li>
                        ) : null}
                        {chosenMech ? (
                            <li key={chosenMech.id}>
                                {formatUnitInfo(chosenMech)}
                            </li>
                        ) : null}
                    </ul>
                </div>
                <div className="techs">
                    <h3>Faction Technologies</h3>
                    <ul>
                        {unitData
                            .filter(unit => unit.id?.endsWith("2") && normalizeFactionAlias(unit.faction?.toLowerCase()) === normalizeFactionAlias(selectedFaction.alias?.toLowerCase()))
                            .map(upgradedUnit => {
                                // Find the base unit for the upgrade (remove "2" from baseType to find the original unit)
                                const baseUnit = unitData.find(unit => unit.baseType === upgradedUnit.baseType.replace("2", "") && unit.faction?.toLowerCase() === selectedFaction.alias?.toLowerCase());
                                const prerequisiteTech = techData.find(tech => tech.alias === upgradedUnit.requiredTechId);
                                return (
                                    <>
                                    <li key={`base-${baseUnit?.id}`}>
                                            {formatUnitInfo(baseUnit)}
                                        </li>
                                        <li key={`upgrade-${upgradedUnit.id}`}>
                                            {formatUnitInfo(upgradedUnit, prerequisiteTech?.requirements)}
                                        </li>
                                    </>
                                );

                            })}
                    </ul>
                    <ul>
                        {techData
                            .filter(tech => normalizeFactionAlias(tech.faction?.toLowerCase()) === normalizeFactionAlias(selectedFaction.alias?.toLowerCase()) && !tech.types?.includes("UNITUPGRADE"))
                            .map(tech => (
                                <li key={tech.alias}>
                                    <strong>{tech.name}</strong> ({renderTechOrUnitImages(tech.requirements)})
                                    <br/>
                                    {formatTechText(tech.text)}
                                </li>
                            ))}
                    </ul>
                </div>
            </div>
            <div className="column column-3">
                <div className="leaders">
                    <h3>Leaders</h3>
                    <ul>
                        {chosenLeaders.map(leader => (
                            <li key={leader.id}>
                                <strong>{leader.name}</strong> ({leader.type}) - {leader.title}
                                <br/>
                                <strong>{leader.abilityWindow}</strong> {leader.abilityText}
                                <br/>
                                {leader.type === "commander" && (
                                    <>
                                        <em>Unlock Condition:</em> {leader.unlockCondition}
                                        <br/>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="pns">
                    <h3>Promissory Notes</h3>
                    <ul>
                        {selectedFaction.promissoryNotes.map(noteAlias => {
                            // Find the matching promissory note from promissoryNoteData by alias
                            const note = promissoryNoteData.find(noteItem => noteItem.alias === noteAlias);

                            return (
                                <li key={noteAlias}>
                                    {note ? (
                                        <>
                                            <strong>{note.name}</strong>
                                            <br/>
                                            <>{note.text}</>
                                        </>
                                    ) : (
                                        <span>{noteAlias} (Unknown Note)</span> // Fallback if the note is not found
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
                {hasExtra ? (
                    <div className="column column-4">
                        <div className="extra">
                            <h3>{factionExtraComponents.title}</h3>
                            <ul>
                                {factionExtraComponents.components.map(function (component, idx) {
                                    return (
                                        <li key={idx}>
                                            <strong>{component.title}</strong>
                                            <br/>{component.text}
                                            <br/>{component.cost ? (<><strong>Cost: </strong>{component.cost}</>) : null}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                ) : null}
            </div>
            );
            }

            export default FactionDetails;
