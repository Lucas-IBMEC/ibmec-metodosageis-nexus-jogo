// Tabuleiro da mesa (versão de 16/11): o lugar de cada monte, das 4 cartas abertas de cada baralho e da missão.
// Tem o tamanho de uma folha A3 deitada e sai em 2 folhas A4: corte a folha 1 na linha tracejada e cole por cima
// da faixa cinza da folha 2. Montado pelo gerar.cjs com as mesmas cores e símbolos das cartas.
// Cada espaço tem 62 x 87 mm: a carta (63 x 88 mm) cobre a linha do espaço, e as cartas vizinhas não se encostam.

module.exports = function montarTabuleiro(d) {
  const { NOME, GRUPO, ABERTAS, ESPECIAIS, emblema, cssDasCartas } = d;

  // ------------------------------------------------------------ medidas (mm)
  const LARG = 62; // largura do espaço de uma carta
  const ALT = 87; // altura do espaço de uma carta
  const LINHAS = [0, 90, 180]; // contexto, persona e formato (3 mm entre as filas)
  const X_MISSAO = 0;
  const X_MONTE = 68;
  const X_ABERTAS = [134, 199, 264, 329];
  const LARGURA = 396; // o tabuleiro inteiro
  const ALTURA = LINHAS[2] + ALT; // 267
  const METADE = 198; // cada folha mostra metade; a emenda cai entre a 1ª e a 2ª aberta (196 a 199)
  if (X_ABERTAS.length !== ABERTAS) throw new Error(`tabuleiro: são ${ABERTAS} cartas abertas`);
  if (!(X_ABERTAS[0] + LARG < METADE && X_ABERTAS[1] > METADE)) throw new Error('tabuleiro: a emenda das folhas não pode cortar um espaço');
  if (X_ABERTAS[3] + LARG > LARGURA) throw new Error('tabuleiro: a última aberta passa da borda');

  const BARALHOS = [
    { tipo: 'Contexto', cls: 't-contexto', sub: 'a situação' },
    { tipo: 'Persona', cls: 't-persona', sub: 'quem responde' },
    { tipo: 'Formato', cls: 't-formato', sub: 'como a resposta chega' },
  ];

  const espaco = (x, y, cls, miolo, extra = '') => `<div class="espaco ${cls} ${extra}" style="left:${x}mm;top:${y}mm">${miolo}</div>`;
  const especiais = Object.values(ESPECIAIS).map((e) => e.ico).join(' ');

  const espacos = [];
  // A coluna da missão: o montinho, a missão da rodada e o lembrete da vez
  espacos.push(espaco(X_MISSAO, LINHAS[0], 't-missao', `${emblema('Missão', 'esp-ico')}<p class="esp-nome">MISSÕES</p><p class="esp-sub">o montinho, virado para baixo</p>`, 'monte'));
  espacos.push(espaco(X_MISSAO, LINHAS[1], 't-missao', `<p class="esp-nome">MISSÃO DA RODADA</p><p class="esp-sub">virada para cima</p><p class="esp-todos">vale para todos os lados</p>`, 'missao-da-rodada'));
  espacos.push(`<div class="lembrete" style="left:${X_MISSAO}mm;top:${LINHAS[2]}mm">
    <p class="lem-nome">${NOME}</p>
    <p class="lem-t">Na vez do seu lado</p>
    <ol>
      <li>Pegue <b>1 contexto, 1 persona e 1 formato</b>.</li>
      <li>De cada baralho: <b>uma das ${ABERTAS} abertas</b> ou a de cima do monte, sem ver.</li>
      <li>Pegou uma aberta? <b>Vire a de cima do monte</b> no lugar dela.</li>
    </ol>
    <p class="lem-esp"><span>${especiais}</span> Especial: roube a carta daquele baralho de um adversário.</p>
  </div>`);
  // As 3 filas: o monte e as 4 abertas
  BARALHOS.forEach((b, i) => {
    const y = LINHAS[i];
    espacos.push(`<div class="faixa ${b.cls}" style="left:${X_MONTE - 2}mm;top:${y - 1}mm;width:${X_ABERTAS[3] + LARG - X_MONTE + 4}mm;height:${ALT + 2}mm"></div>`);
    espacos.push(espaco(X_MONTE, y, b.cls, `${emblema(b.tipo, 'esp-ico')}<p class="esp-nome">${b.tipo.toUpperCase()}</p><p class="esp-sub">monte, virado para baixo</p><p class="esp-o-que">${b.sub}</p>`, 'monte'));
    X_ABERTAS.forEach((x, n) => {
      espacos.push(espaco(x, y, b.cls, `<p class="esp-num">${n + 1}</p><p class="esp-nome">ABERTA</p><p class="esp-sub">carta virada para cima</p>`, 'aberta'));
    });
  });

  const tabuleiro = `<div class="tabuleiro" style="width:${LARGURA}mm;height:${ALTURA}mm">${espacos.join('')}</div>`;

  // Cada folha A4 em pé mostra metade do tabuleiro, a 6 mm da borda (fora da margem que a impressora não imprime)
  const folha = (n) => `<section class="page tab-folha">
  <p class="tab-rotulo"><b>Tabuleiro · folha ${n} de 2 (${n === 1 ? 'esquerda' : 'direita'})</b> · ${n === 1
    ? 'corte na linha tracejada ✂ e cole esta folha por cima da faixa cinza da folha 2'
    : 'a faixa cinza da esquerda fica embaixo da folha 1'}</p>
  <div class="tab-janela"><div class="tab-mover" style="left:${n === 1 ? 0 : -METADE}mm">${tabuleiro}</div></div>
  ${n === 1 ? '<div class="corte"><span>✂</span></div>' : '<div class="cola"><span>cole aqui, embaixo da folha 1</span></div>'}
  <p class="tab-pe">${NOME} · grupo ${GRUPO} · as cartas (63 x 88 mm) cobrem a linha de cada espaço · juntas, as 2 folhas têm o tamanho de uma folha A3</p>
</section>`;

  const css = `${cssDasCartas}
.tab-folha { width: 210mm; height: 297mm; }
.tab-rotulo, .tab-pe { position: absolute; left: 8mm; right: 8mm; margin: 0; font-size: 8pt; color: #4a5368; text-align: center; }
.tab-rotulo { top: 6mm; } .tab-rotulo b { color: #1b1f2a; }
.tab-pe { bottom: 6mm; font-size: 7.4pt; }
.tab-janela { position: absolute; left: 6mm; top: 15mm; width: ${METADE}mm; height: ${ALTURA}mm; overflow: hidden; }
.tab-mover { position: absolute; top: 0; }
.tabuleiro { position: relative; }
.corte { position: absolute; top: 0; bottom: 0; left: 204mm; border-left: .4mm dashed #6b7489; }
.corte span { position: absolute; top: 9mm; left: -2.4mm; font-size: 11pt; color: #4a5368; background: #fff; }
.cola { position: absolute; top: 0; bottom: 0; left: 0; width: 6mm; background: #e6e9f0; }
.cola span { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-90deg); white-space: nowrap; font-size: 6.6pt; color: #6b7489; font-weight: 700; letter-spacing: .06em; }

.faixa { position: absolute; border-radius: 4mm; background: var(--claro); opacity: .55; }
.espaco { position: absolute; width: ${LARG}mm; height: ${ALT}mm; border: .7mm dashed var(--c); border-radius: 3.4mm; background: #fff;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.4mm; text-align: center; color: var(--c); padding: 3mm; }
.espaco p { margin: 0; }
.espaco.monte { border-style: solid; background: repeating-linear-gradient(45deg, var(--claro) 0 2.6mm, #fff 2.6mm 5.2mm); }
.esp-ico { width: 17mm; height: 17mm; background: #fff; border-radius: 50%; padding: 2.6mm; border: .6mm solid var(--c); }
.esp-nome { font-size: 12pt; font-weight: 900; letter-spacing: .08em; background: #fff; padding: 0 2mm; border-radius: 1.4mm; }
.esp-sub { font-size: 8pt; font-weight: 700; color: #2b3245; background: #fff; padding: 0 1.6mm; border-radius: 1.4mm; }
.esp-o-que { font-size: 7.6pt; font-weight: 800; color: #fff; background: var(--c); padding: .4mm 2mm; border-radius: 1.4mm; text-transform: uppercase; letter-spacing: .08em; }
.esp-num { font-size: 40pt; font-weight: 900; line-height: 1; opacity: .28; }
.esp-todos { font-size: 8pt; font-weight: 800; color: #fff; background: var(--c); padding: .6mm 2.2mm; border-radius: 1.4mm; }
.missao-da-rodada { border-width: 1mm; border-style: solid; background: var(--claro); }
.missao-da-rodada .esp-nome { font-size: 11pt; background: none; }
.missao-da-rodada .esp-sub { background: none; }

.lembrete { position: absolute; width: ${LARG}mm; height: ${ALT}mm; border-radius: 3.4mm; background: #16274f; color: #fff; padding: 3.6mm 3.4mm; display: flex; flex-direction: column; gap: 1.6mm; }
.lembrete p { margin: 0; }
.lem-nome { font-size: 12.5pt; font-weight: 900; color: #f2c14e; line-height: 1.1; }
.lem-t { font-size: 8.4pt; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #dfe5f3; }
.lembrete ol { margin: 0; padding-left: 4.4mm; font-size: 8.4pt; line-height: 1.32; } .lembrete li { margin-bottom: 1.2mm; }
.lem-esp { font-size: 7.6pt; line-height: 1.32; color: #dfe5f3; border-top: .3mm solid rgba(255,255,255,.3); padding-top: 1.6mm; }
.lem-esp span { font-size: 10pt; margin-right: 1mm; font-family: 'Segoe UI Emoji', 'Noto Color Emoji', sans-serif; }
`;

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>${NOME} · tabuleiro</title><style>${css}</style></head><body>${folha(1)}${folha(2)}</body></html>`;
  // O tabuleiro inteiro também vai para o manual iconográfico (com o estilo dele)
  return { html, tabuleiro, css: css.replace(cssDasCartas, ''), paginas: 2, largura: LARGURA, altura: ALTURA };
};
