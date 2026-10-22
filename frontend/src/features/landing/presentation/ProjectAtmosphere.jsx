const localPhoto = import.meta.env.DEV
  ? {
      '--crowd-photo':
        'url("/src/features/landing/presentation/assets/torcida-estadio.jpg")',
    }
  : undefined;

export function ProjectAtmosphere() {
  return (
    <div
      className={`project-atmosphere${localPhoto ? ' has-local-photo' : ''}`}
      style={localPhoto}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice" fill="none">
        <path d="M70 55h1060v390H70zM600 55v390M70 150h150v200H70m1060-200H980v200h150" />
        <ellipse cx="600" cy="250" rx="90" ry="90" />
        <path d="M40 20h1120v460H40zM20 0h1160v500H20" />
      </svg>
    </div>
  );
}
