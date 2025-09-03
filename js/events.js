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
