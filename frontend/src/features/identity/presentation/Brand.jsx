import { Link } from 'react-router-dom';

export function Brand({ compact = false }) {
  return (
    <Link
      className={`mengodata-brand ${compact ? 'compact' : ''}`}
      to="/"
      aria-label="MengoData — página inicial"
    >
      <img
        className="brand-crest"
        src="/brand/flamengo.png"
        width="42"
        height="42"
        alt="Escudo do Flamengo"
      />
      <span className="wordmark">
        Mengo<span className="wordmark-data">Data</span>
        <small>INTELIGÊNCIA ESPORTIVA</small>
      </span>
    </Link>
  );
}
