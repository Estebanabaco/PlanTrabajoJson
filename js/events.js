export function setupViewToggles() {
    const buttons = {
        projects: document.getElementById('view-projects-btn'),
        timeline: document.getElementById('view-timeline-btn'),
        calendar: document.getElementById('view-calendar-btn'),
    };
    const views = {
        projects: document.getElementById('projects-view-container'),
        timeline: document.getElementById('timeline-view-container'),
        calendar: document.getElementById('calendar-container'),
    };

    const setActiveView = (activeView) => {
        for (const viewName in views) {
            const isActive = viewName === activeView;
            views[viewName].classList.toggle('hidden', !isActive);
            buttons[viewName].classList.toggle('border-b-4', isActive);
            buttons[viewName].classList.toggle('border-[var(--abaco-naranja)]', isActive);
            buttons[viewName].classList.toggle('text-[var(--abaco-naranja)]', isActive);
            buttons[viewName].classList.toggle('text-gray-500', !isActive);
        }
    };
    
    buttons.projects.addEventListener('click', () => setActiveView('projects'));
    buttons.timeline.addEventListener('click', () => setActiveView('timeline'));
    buttons.calendar.addEventListener('click', () => setActiveView('calendar'));
}

export function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.project-filter-btn');
    const projectContainers = {
        activos: document.getElementById('projects-activos'),
        finalizados: document.getElementById('projects-finalizados'),
        otros: document.getElementById('projects-otros')
    };

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.dataset.filter;
            Object.values(projectContainers).forEach(container => container.classList.add('hidden'));
            projectContainers[filter].classList.remove('hidden');
        });
    });
}

export function setupTimelineViewEvents() {
    const timelineContainer = document.getElementById('timeline-interactive-container');
    if (!timelineContainer) return;

    timelineContainer.addEventListener('click', (event) => {
        const header = event.target.closest('.timeline-stage-header');
        if (!header) return;

        const stageId = header.dataset.stageId;
        if (!stageId) return;

        const detailsElements = document.querySelectorAll(`[data-details-for="${stageId}"]`);
        detailsElements.forEach(el => el.classList.toggle('hidden'));

        const icon = header.querySelector('svg');
        if (icon) {
            icon.classList.toggle('rotate-90');
        }
    });
}

export function setupPopoverEvents() {
    const timelineContainer = document.getElementById('timeline-interactive-container');
    if (!timelineContainer) return;

    let popoverTimeout;

    timelineContainer.addEventListener('mouseover', (event) => {
        const milestone = event.target.closest('.milestone-container');
        if (!milestone) return;

        const popoverContent = milestone.querySelector('.milestone-popover-content');
        if (!popoverContent) return;

        clearTimeout(popoverTimeout);

        let popover = document.getElementById('timeline-popover');
        if (!popover) {
            popover = document.createElement('div');
            popover.id = 'timeline-popover';
            document.body.appendChild(popover);
        }

        popover.innerHTML = popoverContent.innerHTML;

        const milestoneRect = milestone.getBoundingClientRect();
        popover.style.left = `${milestoneRect.left + window.scrollX + milestoneRect.width / 2 - popover.offsetWidth / 2}px`;
        popover.style.top = `${milestoneRect.top + window.scrollY - popover.offsetHeight - 5}px`; // 5px buffer
        
        popover.style.opacity = '1';
    });

    timelineContainer.addEventListener('mouseout', (event) => {
        const milestone = event.target.closest('.milestone-container');
        if (!milestone) return;

        popoverTimeout = setTimeout(() => {
            const popover = document.getElementById('timeline-popover');
            if (popover) {
                popover.style.opacity = '0';
            }
        }, 200); // A small delay to prevent flickering when moving between milestone and popover
    });

    // Also hide popover if mouse moves over it and then out
    document.body.addEventListener('mouseover', (event) => {
        if (event.target.id === 'timeline-popover') {
            clearTimeout(popoverTimeout);
        }
    });
     document.body.addEventListener('mouseout', (event) => {
        if (event.target.id === 'timeline-popover') {
            const popover = document.getElementById('timeline-popover');
            if (popover) {
                popover.style.opacity = '0';
            }
        }
    });
}