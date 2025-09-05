export const planConfig = {
    adminBlockedWeekdays: [1, 2], weekendBlockedWeekdays: [6, 0],
    blockedDaysReason: "Tareas administrativas: Reuniones, crear y/o administrar correos, actualizacion indicadores semanales, mantenimiento de sitios web como agregar logos, nuevos documentos, nuevas graficas, e imprevistos."
};

export let appState = {
    scheduledTasks: [],
    currentCalendarDate: new Date()
};
