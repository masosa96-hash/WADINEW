export function isVeryShort(text) {
  if (!text) return true;
  return text.trim().split(/\s+/).length < 25;
}

export function containsDesireWords(text) {
  return /(quiero|me gustaría|quiero hacer|tengo ganas|deseo)/i.test(text);
}

export function containsBuzzwords(text) {
  return /(sinergia|disruptivo|paradigma|innovador|holístico|ecosistema digital)/i.test(
    text
  );
}

export function lacksConcreteNouns(text) {
  return !/(usuario|problema|sistema|dato|proceso|caso|métrica|evidencia)/i.test(
    text
  );
}

export function containsHelpSignals(text) {
  return /(ayuda|no sé por dónde|qué hago|cómo empiezo)/i.test(text);
}

export function mentionsRealProblem(text) {
  return /(error|bloqueado|no funciona|falla|limitación)/i.test(text);
}
