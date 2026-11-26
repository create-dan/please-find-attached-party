export interface ExportParticipant {
  id: string;
  name: string;
  points: number;
  note?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildTeamsHtmlTable(rows: ExportParticipant[]): string {
  const trRows = rows
    .map((row, index) => {
      const rank = `#${String(index + 1).padStart(2, '0')}`;
      const bg = index % 2 === 0 ? '#ffffff' : '#f8fafc';
      const noteText = row.note ? escapeHtml(row.note) : '—';
      return `<tr style="background-color:${bg};">
        <td style="padding:8px 12px;border:1px solid #cbd5e1;font-family:monospace;font-weight:600;">${rank}</td>
        <td style="padding:8px 12px;border:1px solid #cbd5e1;font-weight:600;">${escapeHtml(row.name)}</td>
        <td style="padding:8px 12px;border:1px solid #cbd5e1;text-align:right;font-family:monospace;font-weight:700;">${row.points}</td>
        <td style="padding:8px 12px;border:1px solid #cbd5e1;color:#475569;">${noteText}</td>
      </tr>`;
    })
    .join('');

  return `<p style="font-weight:700;margin-bottom:8px;">Doom Points Leaderboard (Nov 25 – Dec 17, 2026)</p>
<table style="border-collapse:collapse;font-family:Segoe UI,Arial,sans-serif;font-size:14px;">
  <thead>
    <tr style="background-color:#0f172a;color:#ffffff;">
      <th style="padding:8px 12px;border:1px solid #334155;text-align:left;">Rank</th>
      <th style="padding:8px 12px;border:1px solid #334155;text-align:left;">Name</th>
      <th style="padding:8px 12px;border:1px solid #334155;text-align:right;">Doom Points</th>
      <th style="padding:8px 12px;border:1px solid #334155;text-align:left;">Latest Note</th>
    </tr>
  </thead>
  <tbody>
    ${trRows}
  </tbody>
</table>`;
}

export function buildPlainTextTable(rows: ExportParticipant[]): string {
  const nameWidth = Math.max(
    6,
    ...rows.map((r) => Math.min(28, r.name.length))
  );
  const ptsWidth = Math.max(
    6,
    ...rows.map((r) => String(r.points).length)
  );

  const header = `${'Rank'.padEnd(5)} | ${'Name'.padEnd(nameWidth)} | ${'Points'.padStart(ptsWidth)} | Note`;
  const divider = `${'-'.repeat(5)}-|-${'-'.repeat(nameWidth)}-|-${'-'.repeat(ptsWidth)}-|----------------`;

  const lines = rows.map((row, index) => {
    const rank = `#${String(index + 1).padStart(2, '0')}`.padEnd(5);
    const name = row.name.slice(0, 28).padEnd(nameWidth);
    const pts = String(row.points).padStart(ptsWidth);
    const note = row.note || '—';
    return `${rank} | ${name} | ${pts} | ${note}`;
  });

  return [
    'DOOM POINTS LEADERBOARD (Nov 25 – Dec 17, 2026)',
    '```',
    header,
    divider,
    ...lines,
    '```',
  ].join('\n');
}

export async function copyLeaderboardTable(
  rows: ExportParticipant[]
): Promise<boolean> {
  const html = buildTeamsHtmlTable(rows);
  const plain = buildPlainTextTable(rows);

  if (
    typeof ClipboardItem !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.write === 'function'
  ) {
    try {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      });
      await navigator.clipboard.write([item]);
      return true;
    } catch {
      // Fallback below
    }
  }

  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(plain);
      return true;
    } catch {
      // Fallback below
    }
  }

  // Legacy rich HTML copy fallback for restricted iframes
  try {
    const container = document.createElement('div');
    container.innerHTML = html;
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.setAttribute('contenteditable', 'true');
    document.body.appendChild(container);

    const range = document.createRange();
    range.selectNodeContents(container);
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
    }
    const ok = document.execCommand('copy');
    selection?.removeAllRanges();
    document.body.removeChild(container);
    return ok;
  } catch {
    return false;
  }
}

export async function renderLeaderboardPng(
  rows: ExportParticipant[]
): Promise<Blob> {
  const scale = 2;
  const width = 760;
  const paddingX = 36;
  const headerHeight = 112;
  const tableHeaderHeight = 38;
  const rowHeight = 52;
  const footerHeight = 40;
  const height =
    headerHeight + tableHeaderHeight + rows.length * rowHeight + footerHeight + 24;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable.');
  }

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#0B0F17';
  ctx.fillRect(0, 0, width, height);

  // Card surface
  const cardX = 16;
  const cardY = 16;
  const cardW = width - 32;
  const cardH = height - 32;
  ctx.fillStyle = '#121824';
  ctx.strokeStyle = 'rgba(255,255,255,0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, 12);
  ctx.fill();
  ctx.stroke();

  // Top gradient bar
  const grad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
  grad.addColorStop(0, 'rgb(0,119,200)');
  grad.addColorStop(0.35, 'rgb(14,165,233)');
  grad.addColorStop(0.65, 'rgb(6,182,212)');
  grad.addColorStop(1, 'rgb(139,92,246)');
  ctx.fillStyle = grad;
  ctx.fillRect(cardX, cardY, cardW, 5);

  // Title & Metadata
  ctx.fillStyle = '#38BDF8';
  ctx.font = '600 12px "IBM Plex Mono", monospace';
  ctx.fillText('DOOMS MONTH · NOV 25 – DEC 17, 2026', paddingX, cardY + 38);

  ctx.fillStyle = '#F1F5F9';
  ctx.font = '700 28px "DM Sans", sans-serif';
  ctx.fillText('Doom Points Leaderboard', paddingX, cardY + 72);

  // Table Header
  const thY = cardY + headerHeight;
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.beginPath();
  ctx.moveTo(paddingX, thY);
  ctx.lineTo(width - paddingX, thY);
  ctx.stroke();

  ctx.fillStyle = '#94A3B8';
  ctx.font = '500 12px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  ctx.fillText('RANK', paddingX, thY + 24);
  ctx.fillText('NAME', paddingX + 70, thY + 24);
  ctx.textAlign = 'right';
  ctx.fillText('DOOM POINTS', width - paddingX, thY + 24);

  // Rows
  rows.forEach((row, index) => {
    const y = thY + tableHeaderHeight + index * rowHeight;

    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.beginPath();
    ctx.moveTo(paddingX, y);
    ctx.lineTo(width - paddingX, y);
    ctx.stroke();

    const isLeader = index === 0 && row.points > 0;
    const rankStr = `#${String(index + 1).padStart(2, '0')}`;

    ctx.textAlign = 'left';
    ctx.fillStyle = isLeader ? '#38BDF8' : '#94A3B8';
    ctx.font = '600 14px "IBM Plex Mono", monospace';
    ctx.fillText(rankStr, paddingX, y + 31);

    ctx.fillStyle = '#F1F5F9';
    ctx.font = '600 15px "DM Sans", sans-serif';
    const maxName = row.name.length > 34 ? `${row.name.slice(0, 32)}…` : row.name;
    ctx.fillText(maxName, paddingX + 70, row.note ? y + 23 : y + 31);

    if (row.note) {
      ctx.fillStyle = '#94A3B8';
      ctx.font = '400 12px "DM Sans", sans-serif';
      const maxNote =
        row.note.length > 52 ? `${row.note.slice(0, 50)}…` : row.note;
      ctx.fillText(maxNote, paddingX + 70, y + 40);
    }

    ctx.textAlign = 'right';
    ctx.fillStyle = isLeader ? '#38BDF8' : '#F1F5F9';
    ctx.font = '700 17px "IBM Plex Mono", monospace';
    ctx.fillText(String(row.points), width - paddingX, y + 31);
  });

  // Footer note inside card
  ctx.textAlign = 'left';
  ctx.fillStyle = '#64748B';
  ctx.font = '400 11px "IBM Plex Mono", monospace';
  ctx.fillText(
    'Highest Doom Points on Dec 17 wins · Q4 Doomsday Social',
    paddingX,
    height - 28
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to generate PNG image.'));
    }, 'image/png');
  });
}

export async function copyOrDownloadLeaderboardImage(
  rows: ExportParticipant[]
): Promise<'copied' | 'downloaded'> {
  const blob = await renderLeaderboardPng(rows);

  if (
    typeof ClipboardItem !== 'undefined' &&
    navigator.clipboard &&
    typeof navigator.clipboard.write === 'function'
  ) {
    try {
      const item = new ClipboardItem({ 'image/png': blob });
      await navigator.clipboard.write([item]);
      return 'copied';
    } catch {
      // Fallback to PNG download when browser/iframe blocks image clipboard writes
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'doom-points-leaderboard.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return 'downloaded';
}
