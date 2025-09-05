import { planConfig, appState } from './state.js';

export function calculateAndScheduleTasks(projects) {
    const allTasks = projects.flatMap(p => p.etapas.flatMap(e => e.tareas.map(t => ({...t, projectName: p.nombreProyecto, stageName: e.nombreEtapa}))));
    const allBlockedDays = [...planConfig.adminBlockedWeekdays, ...planConfig.weekendBlockedWeekdays];
    
    const parseLocalDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString + 'T00:00:00');
        return !isNaN(date.getTime()) ? date : null;
    };

    const getNextWorkDay = (date) => {
        const nextDay = new Date(date);
        do {
            nextDay.setDate(nextDay.getDate() + 1);
        } while (
            allBlockedDays.includes(nextDay.getDay()) ||
            (planConfig.blockedDateRanges && planConfig.blockedDateRanges.some(range => {
                const startParts = range.start.split('-').map(s => parseInt(s, 10));
                const endParts = range.end.split('-').map(s => parseInt(s, 10));
                const startDate = new Date(startParts[0], startParts[1] - 1, startParts[2]);
                const endDate = new Date(endParts[0], endParts[1] - 1, endParts[2]);
                return nextDay >= startDate && nextDay <= endDate;
            }))
        );
        return nextDay;
    }

    const tasksWithValidDates = allTasks.map(t => ({ ...t, dateObj: parseLocalDate(t.fechaEntrega) })).filter(t => t.dateObj);

    let projectionDate;
    let remainingDayCapacity = 1.0;

    if (tasksWithValidDates.length > 0) {
        const latestTimestamp = Math.max(...tasksWithValidDates.map(t => t.dateObj.getTime()));
        projectionDate = new Date(latestTimestamp);
        const usedCapacityOnLastDay = tasksWithValidDates.filter(t => t.dateObj.getTime() === latestTimestamp).reduce((sum, task) => sum + (parseFloat(task.estimacionDias) || 0), 0);
        remainingDayCapacity = 1.0 - usedCapacityOnLastDay;
        if (remainingDayCapacity < 0.01) {
            projectionDate = getNextWorkDay(projectionDate);
            remainingDayCapacity = 1.0;
        }
    } else {
        projectionDate = new Date();
        if (allBlockedDays.includes(projectionDate.getDay())) {
             projectionDate = getNextWorkDay(projectionDate);
        }
    }
    
    appState.scheduledTasks = allTasks.map(task => {
        const startDate = parseLocalDate(task.fechaEntrega);
        if (startDate) {
            let duration = parseFloat(task.estimacionDias) || 0;
            let endDate = new Date(startDate);
            while(duration > 1) {
                endDate = getNextWorkDay(endDate);
                duration--;
            }
            return { ...task, startDate, endDate, isTheoretical: false };
        } else {
            const taskEstimation = parseFloat(task.estimacionDias) || 0;

            if (taskEstimation >= 1) {
                // Task takes 1 day or more.
                // It cannot start on a partially filled day.
                if (remainingDayCapacity < 1.0) {
                    projectionDate = getNextWorkDay(projectionDate);
                    remainingDayCapacity = 1.0;
                }
                
                const calculatedStartDate = new Date(projectionDate);
                
                let duration = taskEstimation;
                let calculatedEndDate = new Date(calculatedStartDate);
                while(duration > 1) {
                    calculatedEndDate = getNextWorkDay(calculatedEndDate);
                    duration--;
                }
                
                projectionDate = getNextWorkDay(calculatedEndDate);
                remainingDayCapacity = 1.0;

                return { ...task, startDate: calculatedStartDate, endDate: calculatedEndDate, isTheoretical: true };

            } else {
                // Task takes less than a day.
                if (taskEstimation > remainingDayCapacity) {
                    projectionDate = getNextWorkDay(projectionDate);
                    remainingDayCapacity = 1.0;
                }
                
                const calculatedStartDate = new Date(projectionDate);
                const calculatedEndDate = new Date(projectionDate);
                remainingDayCapacity -= taskEstimation;

                if (remainingDayCapacity < 0.01) {
                    projectionDate = getNextWorkDay(projectionDate);
                    remainingDayCapacity = 1.0;
                }

                return { ...task, startDate: calculatedStartDate, endDate: calculatedEndDate, isTheoretical: true };
            }
        }
    });
}