
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const musica = document.getElementById("musica");
window.addEventListener("load", () => {
    musica.play()
        .then(() => {
            musicaIniciada = true;
        })
        .catch(() => {
            console.log("Aguardando interação para iniciar a música.");
        });
});

const W = 160;
const H = 240;
const CX = 80;
const CY = 100;
const CHAO = 200;

const NUM_PETALAS = 9;

const NOME = "Aninha";
const MENSAGEM_FINAL =
    "Você é a flor mais linda de todas, minha princesa";

const COMP_PETALA = 38;
const LARG_PETALA = 13;

const ROSA = "#ff96c3";
const ROSA_CLARO = "#ff cde4".replace(" ", "");
const ROSA_ESCURO = "#e169a0";
const AMARELO = "#ffd032";
const LARANJA = "#eb961e";
const VERDE = "#2d8c3c";
const VERDE_ESCURO = "#1c5a2d";

canvas.width = W;
canvas.height = H;

ctx.imageSmoothingEnabled = false;

let estrelas = [];
let vagalumes = [];
let capim = [];

let petalas = [];
let caindo = [];
let noChao = [];
let coracoes = [];

let arrancadas = 0;
let frase = "";
let tempo = 0;
let fimTimer = null;
let iniciado = false;
let musicaIniciada = false;

function aleatorio(min, max) {
    return Math.random() * (max - min) + min;
}

function inteiro(min, max) {
    return Math.floor(aleatorio(min, max + 1));
}

function escolha(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

// --------------------------------------------------
// INICIALIZAÇÃO
// --------------------------------------------------

function reinicia() {
    petalas = [];

    for (let i = 0; i < NUM_PETALAS; i++) {
        petalas.push(
            -Math.PI / 2 + i * 2 * Math.PI / NUM_PETALAS
        );
    }

    caindo = [];
    noChao = [];
    coracoes = [];

    arrancadas = 0;
    frase = "";
    tempo = 0;
    fimTimer = null;
    iniciado = false;
}

function criaDetalhes() {
    estrelas = Array.from({ length: 45 }, () => ({
        x: inteiro(2, W - 3),
        y: inteiro(2, 150),
        fase: aleatorio(0, 6.28),
        grande: Math.random() < 0.2
    }));

    vagalumes = Array.from({ length: 6 }, () => ({
        x: aleatorio(10, W - 10),
        y: aleatorio(150, 195),
        fase: aleatorio(0, 6.28)
    }));

    capim = [];

    for (let x = 0; x < W; x += 2) {
        capim.push({
            x,
            altura: inteiro(3, 7),
            cor: escolha([
                "#3ca046",
                "#287837",
                "#50b455"
            ])
        });
    }
}

// --------------------------------------------------
// FORMATO DAS PÉTALAS
// --------------------------------------------------

function pontosPetala(x, y, angulo, comp, larg) {
    const forma = [
        [0.08, 0],
        [0.40, 0.55],
        [0.75, 0.42],
        [1.0, 0],
        [0.75, -0.42],
        [0.40, -0.55]
    ];

    const ca = Math.cos(angulo);
    const sa = Math.sin(angulo);

    return forma.map(([a, c]) => {
        a *= comp;
        c *= larg;

        return [
            x + a * ca - c * sa,
            y + a * sa + c * ca
        ];
    });
}

function desenhaPetala(x, y, angulo, comp = COMP_PETALA, larg = LARG_PETALA) {
    const pts = pontosPetala(x, y, angulo, comp, larg);

    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);

    for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
    }

    ctx.closePath();

    ctx.fillStyle = ROSA;
    ctx.fill();

    const ca = Math.cos(angulo);
    const sa = Math.sin(angulo);

    ctx.beginPath();
    ctx.moveTo(
        x + 0.2 * comp * ca,
        y + 0.2 * comp * sa
    );

    ctx.lineTo(
        x + 0.85 * comp * ca,
        y + 0.85 * comp * sa
    );

    ctx.strokeStyle = ROSA_CLARO;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);

    for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i][0], pts[i][1]);
    }

    ctx.closePath();
    ctx.strokeStyle = ROSA_ESCURO;
    ctx.lineWidth = 1;
    ctx.stroke();
}

function pontoNoPoligono(ponto, poligono) {
    const [x, y] = ponto;
    let dentro = false;
    let j = poligono.length - 1;

    for (let i = 0; i < poligono.length; i++) {
        const [xi, yi] = poligono[i];
        const [xj, yj] = poligono[j];

        const cruza =
            ((yi > y) !== (yj > y)) &&
            (
                x <
                (xj - xi) * (y - yi) /
                ((yj - yi) || 0.000000001) + xi
            );

        if (cruza) dentro = !dentro;

        j = i;
    }

    return dentro;
}

// --------------------------------------------------
// FUNDO
// --------------------------------------------------

function criaFundo() {
    const topo = [14, 14, 60];
    const base = [70, 60, 150];

    for (let y = 0; y < H; y++) {
        let t = Math.min(1, y / 190);

        t = Math.round(t * 12) / 12;

        const cor = topo.map((valor, i) =>
            Math.floor(valor + (base[i] - valor) * t)
        );

        ctx.fillStyle = `rgb(${cor.join(",")})`;
        ctx.fillRect(0, y, W, 1);
    }

    // Lua
    ctx.fillStyle = "#faf5be";
    ctx.beginPath();
    ctx.arc(128, 36, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e1dca0";

    ctx.beginPath();
    ctx.arc(125, 33, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(132, 39, 1, 0, Math.PI * 2);
    ctx.fill();

    // Primeira colina
    ctx.fillStyle = "#2d3278";
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(0, 172);
    ctx.lineTo(35, 160);
    ctx.lineTo(75, 176);
    ctx.lineTo(115, 158);
    ctx.lineTo(160, 172);
    ctx.lineTo(160, 200);
    ctx.closePath();
    ctx.fill();

    // Segunda colina
    ctx.fillStyle = "#1e2664";
    ctx.beginPath();
    ctx.moveTo(0, 200);
    ctx.lineTo(0, 184);
    ctx.lineTo(50, 174);
    ctx.lineTo(100, 186);
    ctx.lineTo(160, 176);
    ctx.lineTo(160, 200);
    ctx.closePath();
    ctx.fill();

    // Chão
    ctx.fillStyle = "#236432";
    ctx.fillRect(0, CHAO, W, H - CHAO);

    ctx.fillStyle = "#194b28";
    ctx.fillRect(0, CHAO + 12, W, H - CHAO);
}

// --------------------------------------------------
// TEXTO
// --------------------------------------------------

function texto(txt, y, tamanho, cor, x = W / 2) {
    ctx.font = `bold ${tamanho}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    ctx.fillStyle = "#140a32";
    ctx.fillText(txt, x + 1, y + 1);

    ctx.fillStyle = cor;
    ctx.fillText(txt, x, y);
}

function quebraLinhas(txt, largura) {
    ctx.font = "bold 9px Arial";

    const palavras = txt.split(" ");
    const linhas = [];

    let atual = "";

    for (const palavra of palavras) {
        const teste = (atual + " " + palavra).trim();

        if (ctx.measureText(teste).width <= largura) {
            atual = teste;
        } else {
            if (atual) linhas.push(atual);
            atual = palavra;
        }
    }

    if (atual) linhas.push(atual);

    return linhas;
}

// --------------------------------------------------
// CORAÇÕES
// --------------------------------------------------

function desenhaCoracao(x, y, cor) {
    const padrao = [
        "01010",
        "11111",
        "11111",
        "01110",
        "00100"
    ];

    ctx.fillStyle = cor;

    padrao.forEach((linha, j) => {
        for (let i = 0; i < linha.length; i++) {
            if (linha[i] === "1") {
                ctx.fillRect(
                    Math.floor(x) + i,
                    Math.floor(y) + j,
                    1,
                    1
                );
            }
        }
    });
}

// --------------------------------------------------
// LÓGICA DO JOGO
// --------------------------------------------------

function arrancar(angulo) {
    if (petalas.length === 0) return;

    const indice = petalas.indexOf(angulo);

    if (indice === -1) return;

    petalas.splice(indice, 1);

    arrancadas++;

    caindo.push({
        x: CX + Math.cos(angulo) * 6,
        y: CY + Math.sin(angulo) * 6,
        ang: angulo,
        spin: aleatorio(-0.08, 0.08),
        vy: 0.3,
        t: aleatorio(0, 6),
        chao: inteiro(CHAO + 6, CHAO + 28)
    });

    frase = arrancadas % 2 === 1
        ? "TE AMO"
        : "NÃO TE AMO";

    if (petalas.length === 0) {
        fimTimer = 0;
    }
}

function atualiza() {
    tempo++;

    for (const p of [...caindo]) {
        p.t += 0.08;

        p.vy = Math.min(p.vy + 0.03, 1.2);
        p.y += p.vy;
        p.x += Math.sin(p.t) * 0.6;
        p.ang += p.spin;

        if (p.y >= p.chao) {
            p.ang = escolha([0.15, Math.PI - 0.15, -0.2]);

            caindo.splice(caindo.indexOf(p), 1);
            noChao.push(p);
        }
    }

    if (fimTimer !== null) {
        fimTimer++;

        if (fimTimer > 90 && tempo % 14 === 0) {
            coracoes.push([
                aleatorio(8, W - 14),
                H + 2,
                aleatorio(0.4, 0.9),
                escolha([
                    "#ff78aa",
                    "#ffaaCD",
                    "#ff5a8c"
                ])
            ]);
        }
    }

    for (const c of [...coracoes]) {
        c[1] -= c[2];

        if (c[1] < -8) {
            coracoes.splice(coracoes.indexOf(c), 1);
        }
    }
}

// --------------------------------------------------
// DESENHO PRINCIPAL
// --------------------------------------------------

function desenha() {
    ctx.clearRect(0, 0, W, H);

    criaFundo();

    // Estrelas piscando
    for (const e of estrelas) {
        const brilho =
            (Math.sin(tempo * 0.04 + e.fase) + 1) / 2;

        const c = Math.floor(120 + 135 * brilho);

        ctx.fillStyle = `rgb(${c},${c},${Math.min(255, c + 20)})`;
        ctx.fillRect(e.x, e.y, 1, 1);

        if (e.grande && brilho > 0.6) {
            const brilhoExtra = Math.floor(c / 2 + 40);

            ctx.fillStyle =
                `rgb(${brilhoExtra},${brilhoExtra},${Math.min(255, brilhoExtra + 40)})`;

            ctx.fillRect(e.x + 1, e.y, 1, 1);
            ctx.fillRect(e.x - 1, e.y, 1, 1);
            ctx.fillRect(e.x, e.y + 1, 1, 1);
            ctx.fillRect(e.x, e.y - 1, 1, 1);
        }
    }

    // Capim
    for (const g of capim) {
        const deslocamento = escolha([0, 0, 1]);

        ctx.strokeStyle = g.cor;
        ctx.lineWidth = 1;

        ctx.beginPath();
        ctx.moveTo(g.x, CHAO + 1);
        ctx.lineTo(
            g.x + deslocamento,
            CHAO - g.altura
        );
        ctx.stroke();
    }

    // Pétalas no chão
    for (const p of noChao) {
        desenhaPetala(p.x, p.y, p.ang, 20, 7);
    }

    // Caule
    ctx.strokeStyle = VERDE;
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.lineTo(CX, CHAO + 6);
    ctx.stroke();

    ctx.strokeStyle = "#50b45a";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(CX - 1, CY + 6);
    ctx.lineTo(CX - 1, CHAO + 4);
    ctx.stroke();

    // Folha esquerda
    ctx.fillStyle = VERDE;

    ctx.beginPath();
    ctx.moveTo(CX, 165);
    ctx.lineTo(CX - 14, 152);
    ctx.lineTo(CX - 26, 156);
    ctx.lineTo(CX - 14, 168);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = VERDE_ESCURO;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Folha direita
    ctx.fillStyle = VERDE;

    ctx.beginPath();
    ctx.moveTo(CX, 180);
    ctx.lineTo(CX + 14, 170);
    ctx.lineTo(CX + 28, 174);
    ctx.lineTo(CX + 14, 185);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = VERDE_ESCURO;
    ctx.stroke();

    // Pétalas da flor
    for (const ang of petalas) {
        desenhaPetala(CX, CY, ang);
    }

    // Miolo da flor
    ctx.fillStyle = LARANJA;
    ctx.beginPath();
    ctx.arc(CX, CY, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = AMARELO;
    ctx.beginPath();
    ctx.arc(CX, CY, 7, 0, Math.PI * 2);
    ctx.fill();

    for (const [dx, dy] of [
        [-3, -2],
        [2, -3],
        [3, 2],
        [-2, 3],
        [0, 0],
        [-4, 1],
        [4, -1]
    ]) {
        ctx.fillStyle = "#fff082";
        ctx.fillRect(CX + dx, CY + dy, 1, 1);
    }

    for (const [dx, dy] of [
        [-1, -4],
        [4, 0],
        [-3, 4],
        [1, 5]
    ]) {
        ctx.fillStyle = LARANJA;
        ctx.fillRect(CX + dx, CY + dy, 1, 1);
    }

    // Pétalas caindo
    for (const p of caindo) {
        desenhaPetala(p.x, p.y, p.ang);
    }

    // Vagalumes
    for (const v of vagalumes) {
        v.fase += 0.02;

        const x = v.x + Math.sin(v.fase * 1.3) * 6;
        const y = v.y + Math.cos(v.fase) * 4;

        if (Math.sin(v.fase * 2) > -0.3) {
            ctx.fillStyle = "#fff58c";
            ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);

            ctx.fillStyle = "#beb45a";
            ctx.fillRect(Math.floor(x) + 1, Math.floor(y), 1, 1);
        }
    }

    // Título
    texto(`Oi, ${NOME}!`, 8, 14, "#ffbedc");

    // Mensagem principal
    if (frase) {
        const cor = arrancadas % 2 === 1
            ? "#ff82af"
            : "#bebeff";

        texto(frase, 30, 18, cor);
    } else if (tempo % 90 < 60) {
        texto("clique para começar", 36, 10, "#dcd2ff");
    }

    // Mensagem final
    if (fimTimer !== null && fimTimer > 60) {
        ctx.fillStyle = "rgba(15, 10, 50, 0.75)";
        ctx.fillRect(6, 196, W - 12, 40);

        const linhas = quebraLinhas(
            MENSAGEM_FINAL,
            W - 22
        );

        const y0 = 200 + (3 - linhas.length) * 5;

        linhas.forEach((linha, i) => {
            texto(linha, y0 + i * 12, 9, "#ffd7eb");
        });

        for (const c of coracoes) {
            desenhaCoracao(c[0], c[1], c[3]);
        }
    }
}

// --------------------------------------------------
// TOQUE E CLIQUE
// --------------------------------------------------

function iniciarMusica() {
    if (musicaIniciada) return;

    musica.volume = 0.35;

    musica.play()
        .then(() => {
            musicaIniciada = true;
        })
        .catch(() => {
            console.log("Toque novamente para iniciar a música.");
        });
}

function tratarToque(evento) {
    evento.preventDefault();

    iniciarMusica();

    if (fimTimer !== null) return;

    const rect = canvas.getBoundingClientRect();

    const x = (evento.clientX - rect.left) * W / rect.width;
    const y = (evento.clientY - rect.top) * H / rect.height;

    for (const ang of [...petalas].reverse()) {
        const poligono = pontosPetala(
            CX,
            CY,
            ang,
            COMP_PETALA,
            LARG_PETALA
        );

        if (pontoNoPoligono([x, y], poligono)) {
            arrancar(ang);
            break;
        }
    }
}

canvas.addEventListener("pointerdown", tratarToque);

// --------------------------------------------------
// LOOP
// --------------------------------------------------

function loop() {
    atualiza();
    desenha();

    requestAnimationFrame(loop);
}

criaDetalhes();
reinicia();
loop();
