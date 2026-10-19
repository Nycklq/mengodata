export function formatValue(number, decimals = 0) {
  return typeof number === 'number' && Number.isFinite(number)
    ? number.toLocaleString('pt-BR', { maximumFractionDigits: decimals })
    : '—';
}
