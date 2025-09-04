import { appState, planConfig } from './state.js';

function getStatusColor(status) { const ls = status.toLowerCase(); if (ls.includes('proceso')) return 'bg-[var(--abaco-verde-lima)] text-[var(--abaco-gris-texto)]'; if (ls.includes('finalizado')) return 'bg-[var(--abaco-verde-hoja)] text-white'; if (ls.includes('iniciado')) return 'bg-[var(--abaco-naranja)] bg-opacity-50 text-[var(--abaco-gris-texto)]'; return 'bg-gray-200 text-gray-800'; }
function getTimelineBarColor(status) {
    const ls = status.toLowerCase();
    if (ls.includes('proceso') || ls.includes('iniciado')) {
        return 'bg-[#D2DE38]'; // Verde Lima ABACO
    }
    if (ls.includes('finalizado')) {
        return 'bg-[#00A859]'; // Verde Hoja ABACO
    }
    return 'bg-gray-400'; // Gris Medio
}
function getDeviationBadge(days) { if (days > 0) return `<span class="px-3 py-1 text-sm font-semibold rounded-full bg-[var(--abaco-naranja)] text-white w-full text-center md:w-auto">${days} día${days > 1 ? 's' : ''} de desvío</span>`; if (days < 0) return `<span class="px-3 py-1 text-sm font-semibold rounded-full bg-[var(--abaco-verde-hoja)] text-white w-full text-center md:w-auto">${Math.abs(days)} día${Math.abs(days) > 1 ? 's' : ''} de adelanto</span>`; return `<span class="px-3 py-1 text-sm font-semibold rounded-full bg-gray-200 text-gray-800 w-full text-center md:w-auto">A tiempo</span>`; }
const getWeekNumber = (d) => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return weekNo;
};
function formatEstimation(days) {
    if (days < 1) {
        const hours = days * 9;
        return `${hours.toFixed(1)} horas`;
    }
    return `${days} día${days > 1 ? 's' : ''}`;
}

export function renderHeader(lastUpdated) {
    document.getElementById('last-updated').textContent = new Date(lastUpdated).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' });
}

export function renderSummary(projects) {
    const container = document.getElementById('summary-cards');
    let totalTasks = 0, delayedTasks = 0, completedTasks = 0;
    projects.forEach(p => p.etapas.forEach(e => { totalTasks += e.tareas.length; e.tareas.forEach(t => { if (t.diasDesvio > 0) delayedTasks++; if (t.estado.toLowerCase().includes('finalizado')) completedTasks++; }); }));
    const summaryData = [ { label: 'Proyectos Totales', value: projects.length, icon: '📂' }, { label: 'Tareas Totales', value: totalTasks, icon: '📝' }, { label: 'Tareas con Desvío', value: delayedTasks, icon: '⚠️' }, { label: 'Tareas Finalizadas', value: completedTasks, icon: '✅' }, ];
    container.innerHTML = summaryData.map(item => `<div class="bg-white p-6 rounded-xl shadow-sm border border-gray-200"><div class="text-4xl mb-2">${item.icon}</div><div class="text-3xl font-bold">${item.value}</div><div class="text-gray-500">${item.label}</div></div>`).join('');
}

export function renderProjects(projects) {
    const activeProjects = projects.filter(p => p.estadoGeneral.toLowerCase().includes('proceso'));
    const finishedProjects = projects.filter(p => p.estadoGeneral.toLowerCase().includes('finalizado'));
    const otherProjects = projects.filter(p => !p.estadoGeneral.toLowerCase().includes('proceso') && !p.estadoGeneral.toLowerCase().includes('finalizado'));
    const renderProjectList = (projectList) => {
        if (projectList.length === 0) return '<p class="text-center text-gray-500 italic py-8">No hay proyectos en esta categoría.</p>';
        return projectList.map(project => `<div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div class="project-header p-6 flex justify-between items-center bg-gray-50 border-b border-gray-200" data-project-id="${project.idProyecto}"><div><h2 class="text-2xl font-bold">${project.nombreProyecto}</h2><div class="flex space-x-4 text-gray-500 text-sm mt-1"><p>Etapa Actual: <span class="font-semibold">${project.etapaActual}</span></p><p>Total Etapas: <span class="font-semibold">${project.etapas.length}</span></p></div></div><div class="flex items-center gap-4"><span class="px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(project.estadoGeneral)}">${project.estadoGeneral}</span><svg class="w-6 h-6 text-gray-500 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></div></div><div class="project-details hidden p-6">${project.etapas.map(stage => `<div class="stage-card mb-6 last:mb-0"><h3 class="text-xl font-semibold mb-3">${stage.nombreEtapa}</h3><div class="stage-info text-sm text-gray-500 mb-4 grid grid-cols-2 md:grid-cols-4 gap-4"><span><strong>Líder:</strong> ${stage.liderResponsable}</span><span><strong>Área:</strong> ${stage.areaResponsable}</span><span><strong>Estado:</strong> ${stage.estadoEtapa}</span></div>${stage.notas ? `<div class="p-3 bg-gray-100 border-l-4 border-gray-300 text-gray-700 rounded-lg mb-4 text-sm"><strong>Nota:</strong> ${stage.notas}</div>` : ''}<div class="tasks-container space-y-3">${stage.tareas.length > 0 ? stage.tareas.map(task => `<div class="task-card border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3"><div class="flex-grow"><p class="font-medium">${task.descripcion}</p><p class="text-xs text-gray-500">Estado: ${task.estado} | Estimación: ${formatEstimation(task.estimacionDias)}</p></div><div class="flex-shrink-0 flex flex-col md:flex-row items-stretch md:items-center gap-3 text-center">${getDeviationBadge(task.diasDesvio)}</div></div>`).join('') : '<p class="text-sm text-gray-500 italic">No hay tareas para esta etapa.</p>'}</div></div>`).join('')}</div></div>`).join('');
    };
    document.getElementById('projects-activos').innerHTML = renderProjectList(activeProjects);
    document.getElementById('projects-finalizados').innerHTML = renderProjectList(finishedProjects);
    document.getElementById('projects-otros').innerHTML = renderProjectList(otherProjects);
    document.querySelectorAll('.project-header').forEach(header => header.addEventListener('click', () => { header.nextElementSibling.classList.toggle('hidden'); header.querySelector('svg').classList.toggle('rotate-180'); }));
}

export function renderTimelineView() {
    const container = document.getElementById('timeline-view-container');
    const ongoingTasks = appState.scheduledTasks.filter(t => !t.estado.toLowerCase().includes('finalizado'));
    if (ongoingTasks.length === 0) {
        container.innerHTML = '<div class="bg-white rounded-xl p-8 shadow-sm border"><p class="text-center text-gray-500 italic">No hay tareas activas para mostrar en la línea de tiempo.</p></div>';
        return;
    }

    const projectsMap = ongoingTasks.reduce((acc, task) => {
        const project = acc[task.projectName] || { projectName: task.projectName, stages: {} };
        const stage = project.stages[task.stageName] || { stageName: task.stageName, tasks: [], startDate: null, endDate: null };
        stage.tasks.push(task);
        project.stages[task.stageName] = stage;
        acc[task.projectName] = project;
        return acc;
    }, {});

    for (const projName in projectsMap) {
        for (const stageName in projectsMap[projName].stages) {
            const stage = projectsMap[projName].stages[stageName];
            stage.startDate = new Date(Math.min(...stage.tasks.map(t => t.startDate)));
            stage.endDate = new Date(Math.max(...stage.tasks.map(t => t.endDate)));
        }
    }
    const projectsData = Object.values(projectsMap).map(p => ({ ...p, stages: Object.values(p.stages) }));

    const allDates = projectsData.flatMap(p => p.stages.flatMap(s => s.tasks.flatMap(t => [t.startDate, t.endDate])) );
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    const timelineStartDate = new Date(minDate);
    timelineStartDate.setDate(minDate.getDate() - (minDate.getDay() === 0 ? 6 : minDate.getDay() - 1));
    const timelineEndDate = new Date(maxDate);
    timelineEndDate.setDate(maxDate.getDate() + (7 - (maxDate.getDay() === 0 ? 7 : maxDate.getDay())));

    const totalDays = (timelineEndDate - timelineStartDate) / (1000 * 60 * 60 * 24);

    let weeks = [];
    let currentDate = new Date(timelineStartDate);
    while (currentDate < timelineEndDate) {
        weeks.push({ year: currentDate.getFullYear(), week: getWeekNumber(currentDate), month: currentDate.toLocaleString('es-ES', { month: 'long' }) });
        currentDate.setDate(currentDate.getDate() + 7);
    }

    let headerMonthsHtml = '';
    const monthsInView = weeks.reduce((acc, week) => {
        const monthYear = `${week.month} ${week.year}`;
        acc[monthYear] = (acc[monthYear] || 0) + 1;
        return acc;
    }, {});
    for (const month in monthsInView) {
        headerMonthsHtml += `<div class="text-center font-bold p-1 border-b border-r" style="grid-column: span ${monthsInView[month]}">${month.charAt(0).toUpperCase() + month.slice(1)}</div>`;
    }
    let headerWeeksHtml = weeks.map(w => `<div class="text-center font-semibold p-1 border-b border-r text-sm">${w.week}</div>`).join('');

    let timelineGridRows = '';
    projectsData.forEach(project => {
        timelineGridRows += `<div class="p-2 bg-gray-200 font-bold border-b text-base">${project.projectName}</div>`;
        project.stages.forEach(stage => {
            const stageId = `${project.projectName}-${stage.stageName}`.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
            const stageStartOffset = (stage.startDate - timelineStartDate) / (1000 * 60 * 60 * 24);
            const stageDuration = (stage.endDate - stage.startDate) / (1000 * 60 * 60 * 24) + 1;
            const stageLeft = (stageStartOffset / totalDays) * 100;
            const stageWidth = (stageDuration / totalDays) * 100;

            let milestonesHtml = '';
            stage.tasks.forEach(task => {
                const taskEndOffset = (task.endDate - timelineStartDate) / (1000 * 60 * 60 * 24);
                const milestoneLeft = ((taskEndOffset - stageStartOffset) / stageDuration) * 100;
                milestonesHtml += `
                    <div class="milestone-container" style="left: ${milestoneLeft}%;">
                        <div class="w-3 h-3 bg-[#F58634] rounded-full border-2 border-white"></div>
                        <div class="milestone-popover">${task.descripcion}</div>
                    </div>
                `;
            });

            timelineGridRows += `
                <div class="flex timeline-stage-header cursor-pointer border-b border-gray-200" data-stage-id="${stageId}">
                    <div class="w-[250px] p-2 border-r text-sm font-semibold bg-white flex items-center">
                         <svg class="w-4 h-4 mr-2 transform transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                         ${stage.stageName}
                    </div>
                    <div class="flex-1 relative border-r h-10">
                        <div class="absolute top-1/2 -translate-y-1/2 h-5 rounded bg-blue-300" style="left: ${stageLeft}%; width: ${stageWidth}%;">
                            ${milestonesHtml}
                        </div>
                    </div>
                </div>
            `;

            let detailsContainerHtml = `<div class="timeline-stage-details hidden" data-details-for="${stageId}">`;
            stage.tasks.forEach(task => {
                const taskStartOffset = (task.startDate - timelineStartDate) / (1000 * 60 * 60 * 24);
                const taskDuration = Math.max((task.endDate - task.startDate) / (1000 * 60 * 60 * 24) + 1, 0.5);
                const taskLeft = (taskStartOffset / totalDays) * 100;
                const taskWidth = (taskDuration / totalDays) * 100;

                detailsContainerHtml += `
                    <div class="flex">
                        <div class="w-[250px] p-2 border-b border-r text-xs text-gray-600 whitespace-normal break-words bg-gray-50 flex items-center pl-10">${task.descripcion}</div>
                        <div class="flex-1 relative border-b border-r h-10">
                            <div class="absolute top-1/2 -translate-y-1/2 h-3 rounded ${getTimelineBarColor(task.estado)}" style="left: ${taskLeft}%; width: ${taskWidth}%;"></div>
                        </div>
                    </div>
                `;
            });
            detailsContainerHtml += '</div>';
            timelineGridRows += detailsContainerHtml;
        });
    });

    const timelineHtml = `
    <div id="timeline-interactive-container" class="bg-white rounded-xl shadow-sm border" style="max-height: 70vh; overflow: auto;">
        <div class="sticky top-0 bg-white z-30">
            <div class="flex">
                <div class="w-[250px] p-2 font-semibold border-b border-r">Etapa</div>
                <div class="flex-1">
                    <div class="grid" style="grid-template-columns: repeat(${weeks.length}, minmax(60px, 1fr));">${headerMonthsHtml}</div>
                    <div class="grid" style="grid-template-columns: repeat(${weeks.length}, minmax(60px, 1fr));">${headerWeeksHtml}</div>
                </div>
            </div>
        </div>
        <div class="relative">${timelineGridRows}</div>
    </div>`;
    
    container.innerHTML = timelineHtml;
}

export function renderCalendar() {
    const container = document.getElementById('calendar-container');
    const { currentCalendarDate: currentDate, scheduledTasks } = appState;
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // 0=Lunes, 6=Domingo
    
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
    
    let calendarHtml = `
        <div class="flex items-center justify-between mb-4">
            <button id="prev-month" class="px-4 py-2 bg-gray-200 rounded-lg">&lt;</button>
            <h2 class="text-2xl font-bold">${monthNames[month]} ${year}</h2>
            <button id="next-month" class="px-4 py-2 bg-gray-200 rounded-lg">&gt;</button>
        </div>
        <div class="mb-4 p-3 bg-gray-50 rounded-lg border">
            <h4 class="font-semibold mb-2 text-sm">Leyenda del Calendario</h4>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-2 text-xs text-gray-600">
                <div class="flex items-center" title="${planConfig.blockedDaysReason}"><span class="w-3 h-3 bg-blue-50 border mr-2"></span>Días Administrativos</div>
                <div class="flex items-center"><span class="w-3 h-3 bg-gray-50 border mr-2"></span>Fin de Semana</div>
                <div class="flex items-center"><span class="w-3 h-3 bg-orange-50 border border-orange-400 mr-2"></span>Fecha Definida</div>
                <div class="flex items-center"><span class="w-3 h-3 bg-gray-100 border border-dashed border-gray-400 mr-2"></span>Fecha Estimada</div>
            </div>
        </div>
        <div class="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr] gap-1 text-center font-semibold">
            <div class="text-xs text-gray-400">Sem</div>
            ${dayNames.map(day => `<div>${day}</div>`).join('')}
        </div>
        <div class="grid grid-cols-[auto,1fr,1fr,1fr,1fr,1fr,1fr,1fr] gap-1 mt-2">`;

    // Añadir celdas vacías para los días antes del inicio del mes
    for (let i = 0; i < startDayOfWeek; i++) {
        if (i === 0) { // Si es el primer día de la semana (Lunes), añadir la celda del número de semana
            const weekDate = new Date(year, month, 1);
            weekDate.setDate(weekDate.getDate() - startDayOfWeek);
            calendarHtml += `<div class="flex items-center justify-center text-xs text-gray-400 font-semibold border border-gray-100">${getWeekNumber(weekDate)}</div>`;
        }
        calendarHtml += `<div class="border border-gray-100 h-28"></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dayDate = new Date(year, month, day);
        const dayOfWeek = dayDate.getDay() === 0 ? 6 : dayDate.getDay() - 1;

        if (dayOfWeek === 0) { // Si es Lunes, añadir la celda del número de semana
            calendarHtml += `<div class="flex items-center justify-center text-xs text-gray-400 font-semibold border border-gray-100">${getWeekNumber(dayDate)}</div>`;
        }

        const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
        const isAdminBlocked = planConfig.adminBlockedWeekdays.includes(dayDate.getDay());
        const isWeekend = planConfig.weekendBlockedWeekdays.includes(dayDate.getDay());
        let dayClasses = 'border border-gray-200 h-36 p-1 overflow-y-auto';
        let dayTitle = '';
        if (isWeekend) { dayClasses += ' bg-gray-50'; }
        if (isAdminBlocked) { dayClasses += ' bg-blue-50'; dayTitle = `title="${planConfig.blockedDaysReason}"`; }
        if (isToday) { dayClasses += ' bg-orange-100'; }
        const tasksForDay = scheduledTasks.filter(task => { const taskDate = task.startDate; return taskDate.getDate() === day && taskDate.getMonth() === month && taskDate.getFullYear() === year; });
        calendarHtml += `<div class="${dayClasses}" ${dayTitle}><div class="font-bold text-right">${day}</div><div class="space-y-1">${tasksForDay.map(task => `<div title="${task.projectName} - ${task.descripcion}" class="p-1 text-xs rounded border-l-4 ${task.isTheoretical ? 'calendar-task-theoretical border-gray-400 bg-gray-100' : 'border-[var(--abaco-naranja)] bg-orange-50'}"><p class="font-semibold truncate">${task.descripcion}</p><p class="text-gray-500 truncate">${task.projectName}</p></div>`).join('')}</div></div>`;
    }
    calendarHtml += `</div>`;
    container.innerHTML = calendarHtml;
    document.getElementById('prev-month').addEventListener('click', () => { appState.currentCalendarDate.setMonth(appState.currentCalendarDate.getMonth() - 1); renderCalendar(); });
    document.getElementById('next-month').addEventListener('click', () => { appState.currentCalendarDate.setMonth(appState.currentCalendarDate.getMonth() + 1); renderCalendar(); });
}