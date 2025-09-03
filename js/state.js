export const planConfig = {
    adminBlockedWeekdays: [1, 2], weekendBlockedWeekdays: [6, 0],
    blockedDaysReason: "Tareas administrativas: Reuniones, correos, actualizaciones e imprevistos."
};

export let appState = {
    scheduledTasks: [],
    currentCalendarDate: new Date()
};
