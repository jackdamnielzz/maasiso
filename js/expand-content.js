document.addEventListener('DOMContentLoaded', function() {
    const infoSection = document.querySelector('#informatiebeveiliging');
    const diensten = infoSection.querySelectorAll('.dienst');
    let expanderContainer = null;

    // Create single expander container after informatiebeveiliging diensten-grid
    const dienstenGrid = infoSection.querySelector('.diensten-grid');
    expanderContainer = document.createElement('div');
    expanderContainer.className = 'expander-container';
    expanderContainer.style.display = 'none';
    dienstenGrid.parentNode.insertBefore(expanderContainer, dienstenGrid.nextSibling);

    diensten.forEach(dienst => {
        // Move hover content to data attribute
        const hoverContent = dienst.querySelector('.hover-content');
        if (hoverContent) {
            dienst.dataset.expandContent = hoverContent.innerHTML;
            hoverContent.remove();
        }

        dienst.addEventListener('mouseenter', function() {
            // Remove active state from all diensten
            diensten.forEach(d => d.classList.remove('active'));
            
            // Add active state to current dienst
            dienst.classList.add('active');

            // Update expander content
            expanderContainer.innerHTML = `
                <div class="expander-content">
                    <div class="expander-grid">
                        ${dienst.dataset.expandContent}
                    </div>
                </div>
            `;

            // Show expander with animation
            expanderContainer.style.display = 'block';
            requestAnimationFrame(() => {
                expanderContainer.classList.add('expanded');
            });
        });
    });

    // Handle mouse leave for the informatiebeveiliging section
    infoSection.addEventListener('mouseleave', function() {
        closeExpander();
    });

    function closeExpander() {
        expanderContainer.classList.remove('expanded');
        diensten.forEach(d => d.classList.remove('active'));
        setTimeout(() => {
            expanderContainer.style.display = 'none';
        }, 300);
    }
});
