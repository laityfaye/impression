import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case '.pdf':  return 'application/pdf';
    case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case '.doc':  return 'application/msword';
    default:      return 'application/octet-stream';
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  // Auth is handled by proxy.ts (admin-session cookie check)
  const { filename } = await params;
  const safeName = path.basename(filename);
  const filePath = path.join(UPLOADS_DIR, safeName);

  if (!filePath.startsWith(UPLOADS_DIR)) {
    return NextResponse.json({ error: 'Fichier invalide' }, { status: 400 });
  }

  try {
    const fileBuffer = await fs.readFile(filePath);
    const stat = await fs.stat(filePath);
    const mimeType = getMimeType(safeName);

    // ?view=1 → afficher inline dans le navigateur ; sinon → forcer le téléchargement
    const inline = request.nextUrl.searchParams.get('view') === '1';
    const disposition = inline
      ? `inline; filename="${safeName}"`
      : `attachment; filename="${safeName}"`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': disposition,
        'Content-Length': String(stat.size),
      },
    });
  } catch {
    return NextResponse.json({ error: 'Fichier introuvable' }, { status: 404 });
  }
}
