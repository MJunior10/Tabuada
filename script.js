/* ===============================
   VARIÁVEIS GLOBAIS
================================= */

let nomeUsuario = "";
let numeroEscolhido = 0;
let perguntas = [];
let indicePergunta = 0;
let pontos = 0;
let vidas = 3;
let tempoMemorizacao = 10;
let tempoResposta = 5;
let intervaloMemorizacao;
let intervaloPergunta;
let respostaCorreta = 0;

/* ===============================
   LOGIN
================================= */

function entrar() {
    nomeUsuario = document.getElementById("nome").value.trim();
    if (!nomeUsuario) return alert("Digite seu nome!");

    localStorage.setItem("usuarioAtual", nomeUsuario);

    document.getElementById("login").classList.add("hidden");
    document.getElementById("menu").classList.remove("hidden");
    document.getElementById("boasVindas").innerText =
        "Olá, " + nomeUsuario + " 👋";

    iniciarMusica();
}

function iniciarMusica() {
    const musica = document.getElementById("musica");
    musica.volume = 0.2;
    musica.play().catch(() => {});
}

/* ===============================
   MENU
================================= */

function mostrarTabuadas() {
    document.getElementById("menu").classList.add("hidden");
    document.getElementById("selecao").classList.remove("hidden");
}

/* ===============================
   INICIAR JOGO
================================= */

function iniciar(numero) {

    numeroEscolhido = numero;
    pontos = 0;
    vidas = 3;
    indicePergunta = 0;
    tempoMemorizacao = 10;

    perguntas = [];

    // Garante que as 10 perguntas existam
    for (let i = 1; i <= 10; i++) {
        perguntas.push(i);
    }

    // Embaralha corretamente
    perguntas.sort(() => Math.random() - 0.5);

    document.getElementById("selecao").classList.add("hidden");
    document.getElementById("resultadoFinal").classList.add("hidden");
    document.getElementById("quiz").classList.add("hidden");
    document.getElementById("estudo").classList.remove("hidden");

    document.getElementById("tituloTabuada").innerText =
        "Tabuada do " + numero;

    let div = document.getElementById("tabuada");
    div.innerHTML = "";

    for (let i = 1; i <= 10; i++) {
        div.innerHTML += `${numero} x ${i} = ${numero * i}<br>`;
    }

    iniciarMemorizacao();
}

/* ===============================
   MEMORIZAÇÃO
================================= */

function mostrarTabuada() {
    let div = document.getElementById("tabuada");
    div.innerHTML = "";

    for (let i = 1; i <= 10; i++) {
        div.innerHTML += `${numeroEscolhido} x ${i} = ${numeroEscolhido * i}<br>`;
    }
}

function iniciarMemorizacao() {

    document.getElementById("contador").innerText =
        "Memorize! ⏳ " + tempoMemorizacao + "s";

    intervaloMemorizacao = setInterval(() => {
        tempoMemorizacao--;

        document.getElementById("contador").innerText =
            "Memorize! ⏳ " + tempoMemorizacao + "s";

        if (tempoMemorizacao <= 0) {
            clearInterval(intervaloMemorizacao);
            iniciarQuiz();
        }

    }, 1000);
}

/* ===============================
   QUIZ
================================= */

function iniciarQuiz() {

    document.getElementById("estudo").classList.add("hidden");
    document.getElementById("quiz").classList.remove("hidden");

    atualizarVidas();
    gerarPergunta();
}

function gerarPergunta() {

    if (indicePergunta >= perguntas.length || vidas <= 0) {
        finalizar();
        return;
    }

    let multiplicador = perguntas[indicePergunta];
    respostaCorreta = numeroEscolhido * multiplicador;

    document.getElementById("pergunta").innerText =
        `${numeroEscolhido} x ${multiplicador} = ?`;

    tempoResposta = 5;
    document.getElementById("tempoPergunta").innerText = tempoResposta;

    intervaloPergunta = setInterval(() => {

        tempoResposta--;
        document.getElementById("tempoPergunta").innerText = tempoResposta;

        if (tempoResposta <= 0) {
            clearInterval(intervaloPergunta);
            vidas--;
            atualizarVidas();
            indicePergunta++;
            gerarPergunta();
        }

    }, 1000);
}

function verificar() {

    clearInterval(intervaloPergunta);

    let respostaUsuario = parseInt(
        document.getElementById("resposta").value
    );

    if (respostaUsuario === respostaCorreta) {
        pontos += 10;
    } else {
        vidas--;
    }

    document.getElementById("resposta").value = "";
    atualizarVidas();
    indicePergunta++;
    gerarPergunta();
}

function atualizarVidas() {
    document.getElementById("vidas").innerText =
        "❤️".repeat(vidas);
}

/* ===============================
   FINALIZAÇÃO
================================= */

function finalizar() {

    document.getElementById("quiz").classList.add("hidden");
    document.getElementById("resultadoFinal").classList.remove("hidden");

    let medalha = "❌ Continue treinando!";
    if (pontos >= 90) medalha = "🥇 Medalha de OURO!";
    else if (pontos >= 70) medalha = "🥈 Medalha de PRATA!";
    else if (pontos >= 50) medalha = "🥉 Medalha de BRONZE!";

    salvarResultado();

    let melhor = localStorage.getItem(
        "melhor_" + nomeUsuario + "_" + numeroEscolhido
    );

    if (!melhor || pontos > melhor) {
        localStorage.setItem(
            "melhor_" + nomeUsuario + "_" + numeroEscolhido,
            pontos
        );
        melhor = pontos;
    }

    document.getElementById("resultadoFinal").innerHTML =
        `
        🎯 Pontuação: ${pontos}/100 <br>
        🏆 Melhor nessa tabuada: ${melhor}/100 <br>
        ${medalha} <br><br>
        <button onclick="voltarMenu()">Voltar ao Menu</button>
        `;
}

function voltarMenu() {
    location.reload();
}

/* ===============================
   SALVAR HISTÓRICO
================================= */

function salvarResultado() {

    let historico =
        JSON.parse(localStorage.getItem("historico")) || [];

    historico.push({
        nome: nomeUsuario,
        tabuada: numeroEscolhido,
        pontos: pontos,
        data: new Date().toLocaleDateString()
    });

    localStorage.setItem("historico", JSON.stringify(historico));
}

/* ===============================
   PAINEL DOS PAIS
================================= */

function abrirPainel() {

    document.getElementById("menu").classList.add("hidden");
    document.getElementById("painel").classList.remove("hidden");

    let historico =
        JSON.parse(localStorage.getItem("historico")) || [];

    let dadosUsuario =
        historico.filter(h => h.nome === nomeUsuario);

    let labels = dadosUsuario.map(d => d.data);
    let dados = dadosUsuario.map(d => d.pontos);

    new Chart(
        document.getElementById("grafico"),
        {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Pontuação",
                    data: dados
                }]
            }
        }
    );

    gerarRanking();
}

function gerarRanking() {

    let historico =
        JSON.parse(localStorage.getItem("historico")) || [];

    let ranking = {};

    historico.forEach(h => {
        if (!ranking[h.nome]) ranking[h.nome] = 0;
        ranking[h.nome] += h.pontos;
    });

    let ordenado =
        Object.entries(ranking)
        .sort((a, b) => b[1] - a[1]);

    let html = "";

    ordenado.forEach((r, index) => {
        html += `${index+1}º 🏅 ${r[0]} - ${r[1]} pontos<br>`;
    });

    document.getElementById("ranking").innerHTML = html;
}

function toggleMusica() {
    const musica = document.getElementById("musica");

    if (musica.paused) {
        musica.play();
    } else {
        musica.pause();
    }
}