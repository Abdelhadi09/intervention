// DemandeCard.jsx

import React from 'react';

const DemandeCard = ({ demande }) => {
    return (
        <div>
            <h2>{demande.title}</h2>
            <p>{demande.description}</p>
        </div>
    );
};

export default DemandeCard;