import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fileName, pageCount } = body;

    if (!fileName || !pageCount) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    // Simulate async verification
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const issues: string[] = [];

    // Simulate heuristic checks based on filename and page count
    const lowerName = fileName.toLowerCase();
    const hasOrientationIssue =
      lowerName.includes('scan') ||
      lowerName.includes('photo') ||
      pageCount > 200;

    const hasMixedContent =
      lowerName.includes('rapport') && pageCount > 150;

    if (hasOrientationIssue) {
      issues.push('Orientation de page incohérente détectée (pages portrait/paysage mélangées)');
    }

    if (hasMixedContent) {
      issues.push('Mise en page non uniforme détectée sur certaines pages');
    }

    const orientationOk = !hasOrientationIssue;
    const valid = issues.length === 0;

    return NextResponse.json({
      valid,
      issues,
      orientationOk,
    });
  } catch (error) {
    console.error('Verify error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    );
  }
}
