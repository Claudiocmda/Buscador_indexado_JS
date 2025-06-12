const input = document.getElementById('searchInput');
const suggestionsBox = document.getElementById('suggestions');
const resultsBox = document.getElementById('results');

input.addEventListener('input', async () => {
    const query = input.value.trim();
    suggestionsBox.innerHTML = "";
    resultsBox.innerHTML = "";

    if (query.length === 0) return;

    const res = await fetch(`/sugerencias?query=${encodeURIComponent(query)}`);
   


    const sugerencias = await res.json();

    sugerencias.forEach(name => {
        const div = document.createElement('div');
        div.textContent = name;
        div.addEventListener('click', () => seleccionarStreamer(name));
        suggestionsBox.appendChild(div);
    });
});

async function seleccionarStreamer(name) {
    suggestionsBox.innerHTML = '';
    input.value = name;

    const res = await fetch(`/info?streamer=${encodeURIComponent(name)}`);
    const resultados = await res.json();

    resultsBox.innerHTML = `<h3>Resultados para "${name}":</h3>`;
    resultados.forEach(item => {
        const div = document.createElement('div');
        div.innerHTML = `
            <p><strong>${item.title}</strong></p>
            <p><a href="${item.link}" target="_blank">${item.link}</a></p>
            <p>${item.snippet}</p>
            ${item.image ? `<img src="${item.image}" alt="imagen" style="max-width: 200px;">` : ""}
            <hr>
        `;
        resultsBox.appendChild(div);
    });
}
