import { NextRequest, NextResponse } from 'next/server';
import { MIN_PAGES } from '@/lib/pricing';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';
export const maxDuration = 30;

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

const ACCEPTED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
]);

async function extractPdfPageCount(buffer: Buffer): Promise<number> {
  try {
    const pdfParse = (await import('pdf-parse')).default;
    const data = await pdfParse(buffer);
    return data.numpages;
  } catch {
    const text = buffer.toString('binary');
    const matches = text.match(/\/Type\s*\/Page[^s]/g);
    if (matches && matches.length > 0) return matches.length;
    throw new Error('Impossible de lire le fichier PDF');
  }
}

async function extractDocxPageCount(buffer: Buffer): Promise<number> {
  const AdmZip = (await import('adm-zip')).default;
  let zip: InstanceType<typeof AdmZip>;
  try {
    zip = new AdmZip(buffer);
  } catch {
    throw new Error('Fichier Word invalide ou corrompu');
  }

  // Stratégie 1 : métadonnées app.xml (fiable si le doc a été sauvegardé dans Word)
  const appXmlEntry = zip.getEntry('docProps/app.xml');
  if (appXmlEntry) {
    const appXml = appXmlEntry.getData().toString('utf8');
    const match = appXml.match(/<Pages>(\d+)<\/Pages>/);
    if (match && parseInt(match[1], 10) > 0) {
      return parseInt(match[1], 10);
    }
  }

  // Stratégie 2, 3 & 4 : analyser le corps du document
  const docXmlEntry = zip.getEntry('word/document.xml');
  if (!docXmlEntry) {
    throw new Error('Fichier Word invalide ou corrompu');
  }
  const docXml = docXmlEntry.getData().toString('utf8');

  // Stratégie 2 : sauts de page enregistrés lors du dernier rendu Word
  const renderedBreaks = (docXml.match(/<w:lastRenderedPageBreak\/>/g) || []).length;
  if (renderedBreaks > 0) {
    return renderedBreaks + 1;
  }

  // Stratégie 3 : sauts de page explicites manuels (<w:br w:type="page"/>)
  const explicitBreaks = (docXml.match(/<w:br[^>]*w:type=["']page["'][^>]*\/?>/g) || []).length;
  if (explicitBreaks > 0) {
    return explicitBreaks + 1;
  }

  // Stratégie 4 : estimation combinée mots + paragraphes (valeur la plus haute)
  // — 150 mots/page : conservateur pour documents avec images, tableaux, grands caractères
  // — 25 paragraphes/page : utile pour docs avec peu de texte mais beaucoup de blocs
  const plainText = docXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const wordCount  = plainText.split(/\s+/).filter((w) => w.length > 0).length;
  const paraCount  = (docXml.match(/<w:p[ >]/g) || []).length;
  const fromWords  = Math.round(wordCount / 150);
  const fromParas  = Math.round(paraCount  / 25);
  return Math.max(1, fromWords, fromParas);
}

function sanitizeFileName(originalName: string, prefix: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext)
    .replace(/[^a-zA-Z0-9_\-]/g, '_')
    .slice(0, 50);
  return `${prefix}_${baseName}${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 });
    }

    if (!ACCEPTED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Seuls les fichiers PDF et Word (.docx) sont acceptés' },
        { status: 400 }
      );
    }

    // Rejeter les anciens .doc (format binaire Office 97-2003)
    if (file.type === 'application/msword') {
      return NextResponse.json({
        pageCount: 0,
        fileName: file.name,
        valid: false,
        reason:
          "Le format .doc (ancien Word) n'est pas supporté. Veuillez enregistrer votre document en .docx (Word 2007 et +) ou en PDF, puis réessayez.",
      });
    }

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Le fichier ne doit pas dépasser 50 Mo' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isPdf = file.type === 'application/pdf';

    let pageCount: number;
    try {
      pageCount = isPdf
        ? await extractPdfPageCount(buffer)
        : await extractDocxPageCount(buffer);
    } catch (err) {
      return NextResponse.json({
        pageCount: 0,
        fileName: file.name,
        valid: false,
        reason:
          err instanceof Error
            ? err.message
            : 'Impossible de lire le fichier. Vérifiez qu\'il n\'est pas corrompu.',
      });
    }

    if (pageCount < MIN_PAGES) {
      return NextResponse.json({
        pageCount,
        fileName: file.name,
        valid: false,
        reason:
          "Ce document ne peut pas être imprimé. Notre plateforme accepte uniquement les documents d'au moins 10 pages.",
      });
    }

    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const timestamp = Date.now();
    const savedFileName = sanitizeFileName(file.name, String(timestamp));
    const filePath = path.join(UPLOADS_DIR, savedFileName);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      pageCount,
      fileName: file.name,
      savedFileName,
      valid: true,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors du traitement du fichier' },
      { status: 500 }
    );
  }
}
