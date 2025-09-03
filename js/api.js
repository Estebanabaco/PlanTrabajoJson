export async function fetchPlanData() {
    try {
        const response = await fetch('json/plan.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error al cargar el archivo json/plan.json:', error);
        document.getElementById('app').innerHTML = `<p class="text-center text-red-600 font-bold">Error: No se pudieron cargar los datos del plan.</p>`;
        return null;
    }
}
