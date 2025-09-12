export const planConfig = {
    adminBlockedWeekdays: [1, 2], weekendBlockedWeekdays: [6, 0],
    blockedDaysReason: "Tareas administrativas: Reuniones, crear y/o administrar correos, actualizacion indicadores semanales, mantenimiento de sitios web como agregar logos, nuevos documentos, nuevas graficas, e imprevistos.",
    blockedDateRanges: [
        { start: '2025-09-22', end: '2025-09-26', reason: 'Vacaciones' },
        { start: '2025-10-022', end: '2025-10-03', reason: 'Evento ESRI' }
    ]
};

export let appState = {
    scheduledTasks: [],
    currentCalendarDate: new Date()
};
