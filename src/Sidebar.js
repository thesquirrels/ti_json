// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({dataSources, handleDataSourceChange }) => {
    return (
        <>
        <div className="sidebar">
            <div className={"links"}>
                <Link to="factions">Factions</Link>
                <Link to="action-cards">Action Cards</Link>
                <Link to="agendas">Agendas</Link>
                <Link to="public-objectives">Public Objectives</Link>
                <Link to="secret-objectives">Secret Objectives</Link>
                <Link to="explores">Explores</Link>
                <Link to="relics">Relics</Link>
            </div>
            <div className={"checkboxes"}>
                {/* Checkboxes for Data Sources */}
                <label>
                    <input
                        type="checkbox"
                        checked={dataSources.basePok}
                        onChange={() => handleDataSourceChange('basePok')}
                    />
                    Base + PoK
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={dataSources.keleres}
                        onChange={() => handleDataSourceChange('keleres')}
                    />
                    Keleres
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={dataSources.discordantStars}
                        onChange={() => handleDataSourceChange('discordantStars')}
                    />
                    Discordant Stars
                </label>
            </div>
        </div>
        <div className={"arrow-container"}>
            <span className="arrow">⌄</span>
        </div>
        </>
)
    ;
};

export default Sidebar;
