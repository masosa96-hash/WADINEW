export function isVeryShort(text: string): boolean {
  if (!text) return true;
  return text.trim().split(/\s+/).length < 25;
}

export function containsDesireWords(text: string): boolean {
  return /(quiero|me gustaría|quiero hacer|tengo ganas|deseo)/i.test(text);
}

export function containsBuzzwords(text: string): boolean {
  return /(sinergia|disruptivo|paradigma|innovador|holístico|ecosistema digital)/i.test(
    text
  );
}

export function lacksConcreteNouns(text: string): boolean {
  return !/(usuario|problema|sistema|dato|proceso|caso|métrica|evidencia)/i.test(
    text
  );
}

export function containsHelpSignals(text: string): boolean {
  return /(ayuda|no sé por dónde|qué hago|cómo empiezo)/i.test(text);
}

export function mentionsRealProblem(text: string): boolean {
  return /(error|bloqueado|no funciona|falla|limitación)/i.test(text);
}
