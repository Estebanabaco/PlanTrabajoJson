import { fetchPlanData } from './api.js';
import { calculateAndScheduleTasks } from './calculations.js';
import { renderHeader, renderSummary, renderProjects, renderTimelineView, renderCalendar } from './ui.js';
import { setupViewToggles, setupProjectFilters } from './events.js';

document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchPlanData();
    if (data) {
        initializeDashboard(data);
    }
});

function initializeDashboard(data) {
    renderHeader(data.ultimaActualizacion);
    renderSummary(data.proyectos);
    calculateAndScheduleTasks(data.proyectos);
    renderProjects(data.proyectos);
    renderTimelineView();
    renderCalendar();
    
    setupViewToggles();
    setupProjectFilters();
}
