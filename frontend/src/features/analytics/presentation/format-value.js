export function formatValue(number, decimals = 0) {
  return typeof number === 'number' && Number.isFinite(number)
    ? number.toLocaleString('pt-BR', { maximumFractionDigits: decimals })
    : '—';
}

export function formatCollectiveValue(value) {
  return Number.isFinite(value)
    ? value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
    : 'Indisponível';
}
